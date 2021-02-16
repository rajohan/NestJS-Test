import { InternalServerErrorException, Logger } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";

import { User } from "../auth/user.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { GetTasksFilterDto } from "./dto/get-tasks-filter.dto";
import { Task, TaskStatus } from "./task.entity";

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    private logger = new Logger("TaskRepository");

    async createTask({ title, description }: CreateTaskDto, user: User): Promise<Task> {
        const task = new Task();

        task.title = title;
        task.description = description;
        task.status = TaskStatus.OPEN;
        task.user = user;

        return await this.save(task);
    }

    async getTasks(getTasksFilterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { search, status } = getTasksFilterDto;
        const query = this.createQueryBuilder("task");

        query.where("task.userId = :userId", { userId: user.id });

        if (status) {
            query.andWhere("task.status = :status", { status });
        }

        if (search) {
            query.andWhere(
                "(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)",
                {
                    search: `%${search.toLowerCase()}%`,
                }
            );
        }

        try {
            return await query.getMany();
        } catch (error) {
            this.logger.error(
                `Failed to get tasks for user "${user.username}", DTO: ${JSON.stringify(
                    getTasksFilterDto
                )}, Error stack: ${error.stack}`
            );
            throw new InternalServerErrorException();
        }
    }
}
