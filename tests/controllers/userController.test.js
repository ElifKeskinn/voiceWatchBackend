jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    update: jest.fn()
  },
  Alert: {
    update: jest.fn()
  },
  Contact: {
    update: jest.fn()
  },
  PasswordReset: {
    findOne: jest.fn(),
    destroy: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}));

jest.mock('bcryptjs');
jest.mock('../../services/smsService');

const httpMocks      = require('node-mocks-http');
const bcrypt         = require('bcryptjs');
const { sendSMS }    = require('../../services/smsService');
const db             = require('../../models');
const userController = require('../../controllers/userController');

describe('userController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock request and response
    req = httpMocks.createRequest();
    res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });

    // Simulate Express methods
    req.protocol = 'http';
    req.get = jest.fn().mockReturnValue('localhost:5000');

    // Default body, file
    req.body = {};
    req.file = undefined;

    // Mock authenticated user
    req.user = {
      id: 1,
      profilePic: 'old.jpg',
      toJSON: () => ({ id: 1, password: 'secret', profilePic: 'old.jpg' }),
      validPassword: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue(),
      save: jest.fn().mockResolvedValue()
    };
  });

  describe('getMe', () => {
    it('removes password and returns user data', async () => {
      await userController.getMe(req, res);
      const data = res._getJSONData();
      expect(data.id).toBe(1);
      expect(data.password).toBeUndefined();
      expect(res.statusCode).toBe(200);
    });
  });

  describe('updateProfile', () => {
    it('updates profile fields without file', async () => {
      req.body = { name: 'New', surname: 'Name', age: 30, bloodGroup: 'B+' };
      await userController.updateProfile(req, res);
      expect(req.user.update).toHaveBeenCalledWith({
        name: 'New',
        surname: 'Name',
        age: 30,
        bloodGroup: 'B+',
        profilePic: 'old.jpg'
      });
      expect(res._getJSONData().message).toMatch(/Profil başarıyla güncellendi/);
    });

    it('updates profilePic when file provided', async () => {
      req.file = { filename: 'newpic.png' };
      await userController.updateProfile(req, res);
      expect(req.user.update).toHaveBeenCalledWith(expect.objectContaining({
        profilePic: 'http://localhost:5000/uploads/newpic.png'
      }));
    });

    it('updates profilePic when URL provided in body', async () => {
      req.body = { profilePic: 'http://img.com/pic.jpg' };
      await userController.updateProfile(req, res);
      expect(req.user.update).toHaveBeenCalledWith(expect.objectContaining({
        profilePic: 'http://img.com/pic.jpg'
      }));
    });
  });

  describe('changePassword', () => {
    it('returns 400 if old password is incorrect', async () => {
      req.body = { oldPassword: 'wrong', newPassword: 'newpass' };
      req.user.validPassword.mockResolvedValue(false);
      await userController.changePassword(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/Eski şifre yanlış/);
    });

    it('changes password if old password is correct', async () => {
      req.body = { oldPassword: 'secret', newPassword: 'newpass' };
      req.user.validPassword.mockResolvedValue(true);
      await userController.changePassword(req, res);
      expect(req.user.password).toBe('newpass');
      expect(req.user.save).toHaveBeenCalled();
      expect(res._getJSONData().message).toMatch(/Şifre başarıyla değiştirildi/);
    });
  });

  describe('deleteAccount', () => {
    it('returns 400 if no password provided', async () => {
      req.body = {};
      await userController.deleteAccount(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/Şifre gerekli/);
    });

    it('returns 400 if password is incorrect', async () => {
      req.body = { password: 'wrong' };
      req.user.validPassword.mockResolvedValue(false);
      await userController.deleteAccount(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/Şifre yanlış/);
    });

    it('soft-deletes user and related records', async () => {
      req.body = { password: 'secret' };
      req.user.validPassword.mockResolvedValue(true);
      await userController.deleteAccount(req, res);
      expect(req.user.update).toHaveBeenCalledWith({ isDeleted: true });
      expect(db.Alert.update).toHaveBeenCalled();
      expect(db.Contact.update).toHaveBeenCalled();
      expect(db.PasswordReset.update).toHaveBeenCalled();
      expect(res._getJSONData().message).toMatch(/Hesabınız başarıyla silindi/);
    });
  });

  describe('forgotPassword', () => {
    it('returns 400 if phoneNumber missing', async () => {
      req.body = {};
      await userController.forgotPassword(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 if user not found', async () => {
      req.body = { phoneNumber: '0500123' };
      db.User.findOne.mockResolvedValue(null);
      await userController.forgotPassword(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('creates reset entry and sends SMS on success', async () => {
      req.body = { phoneNumber: '05001234567' };
      const fakeUser = { id: 1 };
      db.User.findOne.mockResolvedValue(fakeUser);
      await userController.forgotPassword(req, res);
      expect(db.PasswordReset.destroy).toHaveBeenCalled();
      expect(db.PasswordReset.create).toHaveBeenCalled();
      expect(sendSMS).toHaveBeenCalled();
      expect(res._getJSONData().message).toMatch(/telefonunuza gönderildi/);
    });
  });

  describe('resetPassword', () => {
    it('returns 400 if resetCode or newPassword missing', async () => {
      req.body = {};
      await userController.resetPassword(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 if invalid or expired reset code', async () => {
      req.body = { resetCode: '123', newPassword: 'np' };
      db.PasswordReset.findOne.mockResolvedValue(null);
      await userController.resetPassword(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/Geçersiz veya süresi dolmuş/);
    });

    it('updates password and deletes reset record on success', async () => {
      req.body = { resetCode: '123', newPassword: 'np' };
      const fakePR = { user: { update: jest.fn() }, destroy: jest.fn() };
      db.PasswordReset.findOne.mockResolvedValue(fakePR);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hash');
      await userController.resetPassword(req, res);
      expect(fakePR.user.update).toHaveBeenCalledWith({ password: 'hash' });
      expect(fakePR.destroy).toHaveBeenCalled();
      expect(res._getJSONData().message).toMatch(/şifreniz başarıyla güncellendi/i);
    });
  });

  describe('updateDeviceToken', () => {
    it('returns 400 if deviceToken missing', async () => {
      req.body = {};
      await userController.updateDeviceToken(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('updates deviceToken successfully', async () => {
      req.body = { deviceToken: 'token123' };
      await userController.updateDeviceToken(req, res);
      expect(req.user.deviceToken).toBe('token123');
      expect(req.user.save).toHaveBeenCalled();
      expect(res._getJSONData().message).toMatch(/Device token başarıyla güncellendi/);
    });
  });
});
