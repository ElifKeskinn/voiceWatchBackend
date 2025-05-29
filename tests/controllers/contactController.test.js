// tests/controllers/contactController.test.js

// Mock modeller
jest.mock('../../models', () => ({
  Contact: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create:  jest.fn(),
    update:  jest.fn(),
    destroy: jest.fn()
  }
}));

const contactController = require('../../controllers/contactController');
const db                = require('../../models');
const httpMocks         = require('node-mocks-http');

describe('contactController', () => {
  let req, res;

  // Hata log'larını susturmak için:
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    req = httpMocks.createRequest({ user: { id: 1 } });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('getContacts', () => {
    it('başarılı → liste dönmeli', async () => {
      db.Contact.findAll.mockResolvedValue([{id:1}]);
      await contactController.getContacts(req, res);
      expect(res._getJSONData()).toEqual([{id:1}]);
      expect(res.statusCode).toBe(200);
    });

    it('hata → 500 dönmeli', async () => {
      db.Contact.findAll.mockRejectedValue(new Error());
      await contactController.getContacts(req, res);
      expect(res.statusCode).toBe(500);
    });
  });

  describe('addContact', () => {
    it('eksik alan → 400 dönmeli', async () => {
      req.body = {};
      await contactController.addContact(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('duplicate numara → 400 dönmeli', async () => {
      req.body = { contactNumber:'1', contactInfo:'X' };
      db.Contact.findOne.mockResolvedValue({});  // zaten var
      await contactController.addContact(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('başarılı ekleme → 201 dönmeli', async () => {
      req.body = { contactNumber:'1', contactInfo:'X' };
      db.Contact.findOne.mockResolvedValue(null);
      db.Contact.create.mockResolvedValue({ id: 2 });
      await contactController.addContact(req, res);
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({ id:2 });
    });
  });

  describe('updateContact', () => {
    it('bulunamaz → 404 dönmeli', async () => {
      req.params = { id:5 };
      req.body   = {};
      db.Contact.findOne.mockResolvedValue(null);
      await contactController.updateContact(req, res);
      expect(res.statusCode).toBe(404);
    });

    it('duplicate numara → 400 dönmeli', async () => {
      const c = { userId:1, contactNumber:'1', isDeleted:false, save: jest.fn() };
      req.params = { id:5 };
      req.body   = { contactNumber:'2' };
      db.Contact.findOne
        .mockResolvedValueOnce(c)   // güncellenecek
        .mockResolvedValueOnce({}); // yeni numara duplicate
      await contactController.updateContact(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('başarılı güncelleme → 200 dönmeli', async () => {
      // save() fonksiyonu JSON'a dahil olmuyor, bu yüzden sadece data alanlarını test ediyoruz
      const c = {
        userId:        1,
        contactNumber: '1',
        contactInfo:   'Y',
        isDeleted:     false,
        save:          jest.fn()
      };
      req.params = { id:5 };
      req.body   = { contactInfo:'Y' };
      db.Contact.findOne.mockResolvedValue(c);

      await contactController.updateContact(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        userId:        1,
        contactNumber: '1',
        contactInfo:   'Y',
        isDeleted:     false
      });
    });
  });

  describe('deleteContact', () => {
    it('bulunamaz → 404 dönmeli', async () => {
      req.params = { id:5 };
      db.Contact.findOne.mockResolvedValue(null);
      await contactController.deleteContact(req, res);
      expect(res.statusCode).toBe(404);
    });

    it('başarılı silme → 200 dönmeli', async () => {
      const c = { destroy: jest.fn() };
      req.params = { id:5 };
      db.Contact.findOne.mockResolvedValue(c);
      await contactController.deleteContact(req, res);
      expect(res._getJSONData().message).toMatch(/silindi/);
      expect(res.statusCode).toBe(200);
    });
  });
});
