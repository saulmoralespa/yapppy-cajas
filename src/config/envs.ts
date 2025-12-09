import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
    // Server configuration
    PORT: get('PORT').default(3000).asPortNumber(),
    
    // Yappy API credentials
    YAPPY_API_KEY: get('YAPPY_API_KEY').required().asString(),
    YAPPY_SECRET_KEY: get('YAPPY_SECRET_KEY').required().asString(),

    YAPPY_ID_DEVICE: get('YAPPY_ID_DEVICE')
        .required()
        .asString(),
    
    YAPPY_NAME_DEVICE: get('YAPPY_NAME_DEVICE')
        .required()
        .asString(),
    
    YAPPY_USER_DEVICE: get('YAPPY_USER_DEVICE')
        .required()
        .asString(),
    
    YAPPY_ID_GROUP: get('YAPPY_ID_GROUP')
        .required()
        .asString(),
    
    // Yappy URLs
    YAPPY_BASE_URL: get('YAPPY_BASE_URL')
        .required()
        .asString(),
    
    YAPPY_SANDBOX_BASE_URL: get('YAPPY_SANDBOX_BASE_URL')
        .required()
        .asString(),
    // Environment mode
    YAPPY_SANDBOX: get('YAPPY_SANDBOX')
        .default('true')
        .asBool(),
}