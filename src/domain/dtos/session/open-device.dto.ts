
export class OpenDeviceDto {
    
    private constructor(
        public idDevice: string,
        public nameDevice: string,
        public userDevice: string,
        public groupId: string
    ) {}

    static create(object: {[key: string]: any}): [string?, OpenDeviceDto?] {
        
        const { idDevice, nameDevice, userDevice, groupId } = object;

        if (typeof idDevice !== 'string' || idDevice.trim() === '') {
            return ['Invalid or missing "idDevice" field'];
        }

        if (typeof nameDevice !== 'string' || nameDevice.trim() === '') {
            return ['Invalid or missing "nameDevice" field'];
        }

        if (typeof userDevice !== 'string' || userDevice.trim() === '') {
            return ['Invalid or missing "userDevice" field'];
        }

        if (typeof groupId !== 'string' || groupId.trim() === '') {
            return ['Invalid or missing "groupId" field'];
        }
        
        return [
            undefined,
            new OpenDeviceDto(idDevice, nameDevice, userDevice, groupId)
        ];
    }

}