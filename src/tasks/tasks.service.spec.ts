import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { User } from "../auth/user.entity";
import { GetTasksFilterDto } from "./dto/get-tasks-filter.dto";
import { Task, TaskStatus } from "./task.entity";
import { TaskRepository } from "./task.repository";
import { TasksService } from "./tasks.service";

const mockUser: User = new User();
mockUser.id = 1;
mockUser.username = "Test User";

const mockTask: Task = new Task();
mockTask.id = 1;
mockTask.title = "Test";
mockTask.description = "Test Description";
mockTask.userId = mockUser.id;
mockTask.status = TaskStatus.OPEN;

describe("TasksService", () => {
    let tasksService: TasksService;
    let taskRepository: TaskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [TasksService, TaskRepository],
        }).compile();

        tasksService = await module.get(TasksService);
        taskRepository = await module.get(TaskRepository);
    });

    describe("getTasks", () => {
        it("gets all tasks from the repository", async () => {
            jest.spyOn(taskRepository, "getTasks").mockResolvedValue([mockTask]);

            const filters: GetTasksFilterDto = {
                status: TaskStatus.IN_PROGRESS,
                search: "Some search query",
            };

            expect(taskRepository.getTasks).not.toHaveBeenCalled();

            const result = await tasksService.getTasks(filters, mockUser);

            expect(taskRepository.getTasks).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockTask]);
        });
    });

    describe("getTaskById", () => {
        it("successfully gets and returns the task", async () => {
            jest.spyOn(taskRepository, "findOne").mockResolvedValue(mockTask);

            const result = await tasksService.getTaskById(mockTask.id, mockUser);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockTask.id, userId: mockUser.id },
            });
            expect(result).toEqual(mockTask);
        });

        it("throws and error if task is not found", () => {
            // @ts-ignore
            jest.spyOn(taskRepository, "findOne").mockResolvedValue(null);

            expect(tasksService.getTaskById(21312, mockUser)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe("createTask", () => {
        it("Calls taskRepository.create() and returns the result", async () => {
            jest.spyOn(taskRepository, "createTask").mockResolvedValue(mockTask);

            expect(taskRepository.createTask).not.toHaveBeenCalled();

            const result = await tasksService.createTask(mockTask, mockUser);

            expect(taskRepository.createTask).toHaveBeenCalledWith(mockTask, mockUser);
            expect(result).toEqual(mockTask);
        });
    });

    describe("deleteTask", () => {
        it("calls taskRepository.deleteTask to delete a task", async () => {
            jest.spyOn(taskRepository, "delete").mockResolvedValue({
                raw: "",
                affected: 1,
            });

            await tasksService.deleteTask(mockTask.id, mockUser);

            expect(taskRepository.delete).toHaveBeenCalledWith({
                id: mockTask.id,
                userId: mockUser.id,
            });
        });

        it("throws an error if task is not found", () => {
            jest.spyOn(taskRepository, "delete").mockResolvedValue({
                raw: "",
                affected: 0,
            });

            expect(tasksService.deleteTask(mockTask.id, mockUser)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe("updateTaskStatus", () => {
        it("updates a tasks status", async () => {
            jest.spyOn(tasksService, "getTaskById").mockResolvedValue(mockTask);
            jest.spyOn(taskRepository, "save").mockResolvedValue(mockTask);

            const result = await tasksService.updateTaskStatus(
                mockTask.id,
                TaskStatus.DONE,
                mockUser
            );

            expect(tasksService.getTaskById).toHaveBeenCalledWith(mockTask.id, mockUser);
            expect(taskRepository.save).toHaveBeenCalled();
            expect(result.status).toBe(TaskStatus.DONE);
        });
    });
});
