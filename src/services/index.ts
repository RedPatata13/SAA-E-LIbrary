import localService from './localService';
import awsService from './awsService';

const mode = import.meta.env.VITE_STORAGE_MODE || 'local';
export default mode === 'aws' ? awsService : localService;

