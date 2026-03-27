export type UserRole = 'editor' | 'miniaturero' | 'youtuber';

export interface UserProfile {
  id: string;
  nombre_completo: string;
  email: string;
  rol: UserRole;
  verificado_id?: boolean;
  fecha_registro?: string;
  bio?: string;
  especialidad?: string;
  precio_hora?: number;
  avatar?: string;
  github_url?: string;
  youtube_url?: string;
  calificacion_avg?: number;
}

export interface PortfolioItem {
  id: string;
  usuario_id: string;
  titulo: string;
  descripcion?: string;
  url_video?: string;
  url_imagen?: string;
  tipo: 'video' | 'thumbnail';
  createdAt?: string;
}

export interface Contract {
  id: string;
  cliente_id: string;
  profesional_id: string;
  monto_total: number;
  metodo_pago?: 'tarjeta' | 'paypal' | 'transferencia';
  estado: 'pendiente' | 'pagado' | 'en_proceso' | 'entregado';
  fecha_contrato?: string;
}

export interface Message {
  id: string;
  emisor_id: string;
  receptor_id: string;
  mensaje: string;
  leido?: boolean;
  enviado_el?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
