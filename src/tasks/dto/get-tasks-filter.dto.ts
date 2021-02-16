import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";

import { TaskStatus } from "../task.entity";

export class GetTasksFilterDto {
    @IsOptional()
    @IsEnum(TaskStatus, {
        message: ({ value, property }) =>
            `${value} is an invalid ${property}. The allowed values are ${Object.values(
                TaskStatus
            ).join(", ")}`,
    })
    status: TaskStatus;

    @IsOptional()
    @IsNotEmpty()
    search: string;
}
