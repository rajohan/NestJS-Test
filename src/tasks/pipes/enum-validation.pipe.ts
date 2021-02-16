import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";

export class EnumValidationPipe implements PipeTransform {
    readonly allowedStatuses = Object.values(this.validationEnum);

    constructor(private validationEnum: { [name: string]: string }) {}

    transform(value: string, metadata: ArgumentMetadata) {
        value = value.toUpperCase();

        if (!this.isStatusValid(value)) {
            throw new BadRequestException(`"${value}" is an invalid ${metadata.data}`);
        }

        return value;
    }

    private isStatusValid(status: string) {
        return this.allowedStatuses.includes(status);
    }
}
