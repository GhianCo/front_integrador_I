// PARAM
export const PARAM = {
    ACTIVO: '1',
    INACTIVO: '0',
    SI: '1',
    NO: '0',
    UNDEFINED: '-1',
    VACIO: ''
};

// HTTP RESPONSE
export const HTTP_RESPONSE = {
    OK: '200',
    BAD_REQUEST: '400',
    PERMISION_ERROR: '401',
    NOT_FOUND: '404',
    CODE_NOT_DEFINED: '601',
    MALFORMED_JSON: '701',
    ACCESS_DENIED: '403'
};

export enum PETICION {
    SIN_INICIALIZAR = '1',
    EN_PROCESO = '2',
    FINALIZADA = '3'
}

export enum ACTION_CRUD {
    CREATE = '1',
    READ = '2',
    UPDATE = '3',
    DELETE = '4',
}

export enum ORDER_ARRAY {
    ASC = 0,
    DESC = 1,
}

export enum TypeFileToUpload {
    Image = "1",
    Video = "2"
}

export type SortOrderClause = 1 | -1;

export enum TypeFilterApplyToList {
    Order,
    Search,
}

export enum ClauseOrder {
    ASC = 1,
    DESC = -1,
}

export enum DerivadoSituacion {
    ARRENDADO,
    PROPIO,
}

export enum DerivadoEstado {
    NUEVO = 1,
    USADO = 2,
    CON_DETERIOSO = 3,
}

export enum FormatFieldEspecification {
    FIELD_TEXT = 1,
    FIELD_NUMBER = 2,
    FIELD_TRUE_FALSE = 3,
    FIELD_SELECTOR_PREFIX = 4,
    FIELD_SELECTOR_VALUES = 5,
}
