"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class Utils {
    static generateHash(password) {
        return bcrypt_1.default.hashSync(password, bcrypt_1.default.genSaltSync(12));
    }
}
exports.Utils = Utils;
