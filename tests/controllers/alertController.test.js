// tests/controllers/alertController.test.js

// Mock the models first
jest.mock('../../models', () => ({
  Alert: {
    findOne: jest.fn(),
    update:  jest.fn()
  },
  AlertResponse: {
    create: jest.fn()
  }
}));

// Then mock all services
jest.mock('../../services/alertService', () => ({ sendManualAlert: jest.fn() }));
jest.mock('../../services/audioDecodeService', () => ({ decodeBase64ToFloatArray: jest.fn() }));
jest.mock('../../services/melService', () => ({ generateMelSpectrogram: jest.fn() }));
jest.mock('../../services/aiService', () => ({ predictFromSpectrogram: jest.fn() }));
jest.mock('../../services/smsService', () => ({ sendSMS: jest.fn() }));

const alertController      = require('../../controllers/alertController');
const db                   = require('../../models');
const { sendManualAlert: svcSendManual } = require('../../services/alertService');
const { decodeBase64ToFloatArray }       = require('../../services/audioDecodeService');
const { generateMelSpectrogram }         = require('../../services/melService');
const { predictFromSpectrogram }         = require('../../services/aiService');
const { sendSMS }                        = require('../../services/smsService');
const httpMocks                         = require('node-mocks-http');

const CATEGORIES = ['glass_breaking','fall','silence','scream'];

describe('alertController', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      user: { id:1, name:'Test', surname:'User', deviceToken:'tok' }
    });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('sendManualAlert', () => {
    it('başarılı servis → 200 ve mesaj', async () => {
      svcSendManual.mockResolvedValue();
      await alertController.sendManualAlert(req, res);
      expect(svcSendManual).toHaveBeenCalledWith(req.user);
      expect(res._getJSONData()).toEqual({ message:'Acil durum bildirimi gönderildi.' });
      expect(res.statusCode).toBe(200);
    });

    it('servis hata → 500 dönmeli', async () => {
      svcSendManual.mockRejectedValue(new Error('fail'));
      await alertController.sendManualAlert(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData().message).toMatch(/fail/);
    });
  });

  describe('respondAlert', () => {
    it('alertId eksik → 400 dönmeli', async () => {
      req.body = {};
      await alertController.respondAlert(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('kayıt bulunamaz → 404 dönmeli', async () => {
      req.body = { alertId:5 };
      db.Alert.findOne.mockResolvedValue(null);
      await alertController.respondAlert(req, res);
      expect(res.statusCode).toBe(404);
    });

    it('zaten yanıtlandı → 400 dönmeli', async () => {
      req.body = { alertId:5 };
      db.Alert.findOne.mockResolvedValue({ isResponded:true });
      await alertController.respondAlert(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('başarılı yanıt → 200 dönmeli', async () => {
      const fakeAlert = { id:5, isResponded:false, update: jest.fn() };
      req.body = { alertId:5 };
      db.Alert.findOne.mockResolvedValue(fakeAlert);
      await alertController.respondAlert(req, res);
      expect(fakeAlert.update).toHaveBeenCalledWith({ isResponded:true });
      expect(db.AlertResponse.create).toHaveBeenCalledWith({ alertId:5, userId:1 });
      expect(res._getJSONData().message).toMatch(/yanıt verildi/);
    });

    it('hata → 500 dönmeli', async () => {
      req.body = { alertId:5 };
      db.Alert.findOne.mockRejectedValue(new Error('db error'));
      await alertController.respondAlert(req, res);
      expect(res.statusCode).toBe(500);
    });
  });

  describe('sendCustomSMS', () => {
    it('geçersiz body → 400 dönmeli', async () => {
      req.body = { numbers:[], message:'' };
      await alertController.sendCustomSMS(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('başarılı → sent status', async () => {
      req.body = { numbers:['05001234567'], message:'hi' };
      sendSMS.mockResolvedValue({ messageId:'ok' });
      await alertController.sendCustomSMS(req, res);
      const out = res._getJSONData();
      expect(out.results[0]).toMatchObject({ to:'+905001234567', status:'sent' });
    });

    it('SMS hata → error status', async () => {
      req.body = { numbers:['531234'], message:'hi' };
      sendSMS.mockRejectedValue(new Error('sms fail'));
      await alertController.sendCustomSMS(req, res);
      expect(res._getJSONData().results[0].status).toBe('error');
    });
  });

  describe('aiIntegration', () => {
    it('geçersiz data → 400 dönmeli', async () => {
      req.body = { data:123 };
      await alertController.aiIntegration(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('base64 ile başarılı → sonuç dönmeli', async () => {
      req.body = { data: 'YmFzZTY0' };
      decodeBase64ToFloatArray.mockResolvedValue([0,1]);
      generateMelSpectrogram.mockResolvedValue([[0]]);
      predictFromSpectrogram.mockResolvedValue([0.1,0.9,0,0]);
      await alertController.aiIntegration(req, res);
      const out = res._getJSONData();
      expect(out.prediction).toEqual([0.1,0.9,0,0]);
      expect(out.result).toBe('fall');
    });

    it('silence tahmini → safe dönmeli', async () => {
      req.body = { data:[[]] };
      // [glass, fall, silence, scream]
      predictFromSpectrogram.mockResolvedValue([0,0,0.99,0]);
      await alertController.aiIntegration(req, res);
      expect(res._getJSONData().result).toBe('safe');
    });

    it('hata → 500 dönmeli', async () => {
      req.body = { data:[[]] };
      predictFromSpectrogram.mockRejectedValue(new Error('ai fail'));
      await alertController.aiIntegration(req, res);
      expect(res.statusCode).toBe(500);
    });
  });
});
