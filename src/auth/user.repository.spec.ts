import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as bcrypt from "bcrypt";

import { PgIntegrityConstraintViolation } from "../utils/postgresql-error-codes";
import { User } from "./user.entity";
import { UserRepository } from "./user.repository";

const mockCredentialsDto = { username: "Test", password: "Password" };
const mockUser = new User();
mockUser.username = "Test";
mockUser.password = "Password";
mockUser.id = 1;

describe("UserRepository", () => {
    let userRepository: UserRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [UserRepository],
        }).compile();

        userRepository = await module.get(UserRepository);
    });

    describe("signUp", () => {
        it("successfully signs up the user", async () => {
            jest.spyOn(userRepository, "save").mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, "genSalt").mockResolvedValue("TestSalt");
            jest.spyOn(bcrypt, "hash").mockResolvedValue("TestHash");

            await expect(
                userRepository.signUp(mockCredentialsDto)
            ).resolves.not.toThrow();

            expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
            expect(bcrypt.hash).toHaveBeenCalledTimes(1);
            expect(userRepository.save).toHaveBeenCalledWith({
                username: mockCredentialsDto.username,
                password: "TestHash",
            });
        });

        it("throws a conflict exception if username already exists", async () => {
            jest.spyOn(userRepository, "save").mockRejectedValue({
                code: PgIntegrityConstraintViolation.UniqueViolation,
            });

            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
                ConflictException
            );
        });

        it("throws internal server error on error other then username already existing", async () => {
            jest.spyOn(userRepository, "save").mockRejectedValue({
                code: "123456",
            });

            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
                InternalServerErrorException
            );
        });
    });

    describe("validateUserPassword", () => {
        it("returns the username as validation is successful", async () => {
            jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(mockUser, "validatePassword").mockResolvedValue(true);

            const result = await userRepository.validatePassword(mockCredentialsDto);

            expect(mockUser.validatePassword).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockUser.username);
        });

        it("returns null if user cannot be found", async () => {
            // @ts-ignore
            jest.spyOn(userRepository, "findOne").mockResolvedValue(null);
            mockUser.validatePassword = jest.fn();

            const result = await userRepository.validatePassword(mockCredentialsDto);
            expect(mockUser.validatePassword).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it("returns null if password is invalid", async () => {
            jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(mockUser, "validatePassword").mockResolvedValue(false);

            const result = await userRepository.validatePassword(mockCredentialsDto);
            expect(mockUser.validatePassword).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });
    });
});
