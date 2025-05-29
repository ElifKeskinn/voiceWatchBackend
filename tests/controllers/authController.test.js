// tests/controllers/authController.test.js

// 1) models.mock must come before requiring controller
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    create:   jest.fn()
  },
  Contact: {
    bulkCreate: jest.fn()
  }
}));
jest.mock('jsonwebtoken');

const authController = require('../../controllers/authController');
const db             = require('../../models');
const httpMocks      = require('node-mocks-http');
const jwt            = require('jsonwebtoken');
const bcrypt         = require('bcryptjs');
const { ValidationError, UniqueConstraintError } = require('sequelize');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    beforeEach(() => {
      req.body = {
        name: 'A', surname: 'B', tcKimlik: '12345678901',
        age: 20, phoneNumber: '05001234567', password: 'pass1',
        bloodGroup: 'A+', 
        emergencyContacts: [
          { contactNumber:'05001112233', contactInfo:'Anne' },
          { contactNumber:'05004455667', contactInfo:'Baba' }
        ]
      };
    });

    it('eksik kontak → 400 dönmeli', async () => {
      req.body.emergencyContacts = [{ contactNumber:'1', contactInfo:'X' }];
      await authController.signup(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/En az iki acil durum kontak/);
    });

    it('geçersiz TC → 400 dönmeli', async () => {
      req.body.tcKimlik = '123';
      await authController.signup(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/11 haneli/);
    });

    it('mevcut kullanıcı → 400 dönmeli', async () => {
      db.User.findOne.mockResolvedValue({});
      await authController.signup(req, res);
      expect(res.statusCode).toBe(400);
      expect(db.User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tcKimlik:'12345678901', isDeleted:false } })
      );
    });

    it('başarılı oluşturma → 201 dönmeli', async () => {
      db.User.findOne.mockResolvedValue(null);
      db.User.create.mockResolvedValue({ id: 1 });
      await authController.signup(req, res);
      expect(db.User.create).toHaveBeenCalled();
      expect(db.Contact.bulkCreate).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().message).toMatch(/başarıyla oluşturuldu/);
    });

    it('validation hatası → 400 dönmeli', async () => {
      const err = new ValidationError('err', [{ message:'m' }]);
      db.User.create.mockRejectedValue(err);
      await authController.signup(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toBe('m');
    });

    it('sunucu hatası → 500 dönmeli', async () => {
      db.User.create.mockRejectedValue(new Error('db'));
      await authController.signup(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData().message).toBe('Sunucu Hatası');
    });
  });

  describe('login', () => {
    beforeEach(() => {
      req.body = { tcKimlik:'12345678901', password:'pw', deviceToken:'tok123' };
    });

    it('kullanıcı bulunamaz → 400 dönmeli', async () => {
      db.User.findOne.mockResolvedValue(null);
      await authController.login(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('şifre uyumsuz → 400 dönmeli', async () => {
      db.User.findOne.mockResolvedValue({ validPassword: () => Promise.resolve(false) });
      await authController.login(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('başarılı giriş → token dönmeli', async () => {
      const fakeUser = { 
        id:1, 
        validPassword: () => Promise.resolve(true), 
        save: jest.fn() 
      };
      db.User.findOne.mockResolvedValue(fakeUser);
      jwt.sign.mockReturnValue('jwt-token');
      await authController.login(req, res);
      expect(res._getJSONData()).toEqual({ token: 'jwt-token' });
    });

    it('sunucu hatası → 500 dönmeli', async () => {
      db.User.findOne.mockRejectedValue(new Error('fail'));
      await authController.login(req, res);
      expect(res.statusCode).toBe(500);
    });
  });
});
