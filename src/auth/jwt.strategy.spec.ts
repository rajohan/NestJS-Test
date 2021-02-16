import { UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { JwtStrategy } from "./jwt.strategy";
import { User } from "./user.entity";
import { UserRepository } from "./user.repository";

const mockUser: User = new User();
mockUser.id = 1;
mockUser.username = "Test User";

describe("JwtStrategy", () => {
    let jwtStrategy: JwtStrategy;
    let userRepository: UserRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [JwtStrategy, UserRepository],
        }).compile();

        jwtStrategy = await module.get(JwtStrategy);
        userRepository = await module.get(UserRepository);
    });

    it("validates and returns the user based on JWT payload", async () => {
        jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);

        const result = await jwtStrategy.validate({ username: mockUser.username });

        expect(userRepository.findOne).toHaveBeenCalledWith({
            username: mockUser.username,
        });
        expect(result).toEqual(mockUser);
    });

    it("throws an unauthorized exception if user cannot be found", () => {
        // @ts-ignore
        jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

        expect(jwtStrategy.validate({ username: mockUser.username })).rejects.toThrow(
            UnauthorizedException
        );
    });
});
