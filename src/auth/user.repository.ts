import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { EntityRepository, Repository } from "typeorm";

import { PgIntegrityConstraintViolation } from "../utils/postgresql-error-codes";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { User } from "./user.entity";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async signUp({ username, password }: AuthCredentialsDto): Promise<void> {
        const user = new User();

        const salt = await bcrypt.genSalt(10);

        user.username = username;
        user.password = await bcrypt.hash(password, salt);

        try {
            await this.save(user);
        } catch (error) {
            if (error.code === PgIntegrityConstraintViolation.UniqueViolation) {
                throw new ConflictException("Username already exists");
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    async validatePassword({
        username,
        password,
    }: AuthCredentialsDto): Promise<string | null> {
        const user = await this.findOne({ username });

        if (!user) {
            return null;
        }

        const isCorrectPassword = await user.validatePassword(password);

        if (isCorrectPassword) {
            return user.username;
        } else {
            return null;
        }
    }
}
