import * as bcrypt from "bcrypt";

import { User } from "./user.entity";

const mockUser = new User();
mockUser.username = "Test";
mockUser.password = "Password";
mockUser.id = 1;

describe("User entity", () => {
    describe("ValidatePassword", () => {
        it("returns true if password is valid", async () => {
            jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

            const result = await mockUser.validatePassword("Password");
            expect(bcrypt.compare).toHaveBeenCalledWith("Password", mockUser.password);
            expect(result).toEqual(true);
        });

        it("returns false if password is false", async () => {
            jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

            const result = await mockUser.validatePassword("Password2");
            expect(bcrypt.compare).toHaveBeenCalledWith("Password2", mockUser.password);
            expect(result).toEqual(false);
        });
    });
});
