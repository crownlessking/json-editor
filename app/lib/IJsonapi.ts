
/* ----------------------------------------------------------------------------
RESPONSE SPECIFICATION
---------------------------------------------------------------------------- */

export interface IResponseRequirement {
  driver?: string;
}

/* ----------------------------------------------------------------------------
JSONAPI SPECIFICATION
---------------------------------------------------------------------------- */

/**
 * Type for the server response's `jsonapi` member.  
 * An object describing the server’s implementation.
 *
 * _Example Json document_:
 * ```json
 * {
 *    "jsonapi": {} // <-- Type for that member
 * }
 * ```
 * @see https://jsonapi.org/format/#document-jsonapi-object
 */
export interface IJsonapiMember {
  version: string;
  [key: string]: string | undefined;
}

/**
 * Type for the server response's `meta` member.
 *
 * _Example Json document_:
 * ```json
 * {
 *    "jsonapi": {},
 *    "meta": {} // <-- type for that member
 * }
 * ```
 * @see https://jsonapi.org/format/#document-meta
 */
export type TJsonapiMeta = Record<string, Record<string, string>>;

/**
 * @see https://jsonapi.org/format/#document-links
 */
export interface IJsonapiLink {
  href: string;
  meta?: TJsonapiMeta;
}

export interface IJsonapiErrorLinks {
  about?: IJsonapiLink;
  [prop: string]: IJsonapiLink | string | undefined;
}

export interface IJsonapiErrorSource {
  pointer?: string;
  parameter?: string;
}

/**
 * Type for the server response's `errors` member array elements.
 *
 * _Example Json document_:
 * ```json
 * {
 *    "jsonapi": {},
 *    "meta": {},
 *    "errors": [] // <-- type for elements
 * }
 * ```
 * @see https://jsonapi.org/format/#errors
 */
export interface IJsonapiError {
  id?: string;
  links?: IJsonapiErrorLinks;
  status?: string;
  code: string;
  title: string;
  detail?: string;
  source?: IJsonapiErrorSource;
  meta?: TJsonapiMeta;
}

interface IJsonapiAbstractLinks {
  self: IJsonapiLink | string;
  related?: IJsonapiLink | string;
}

/**
 * @see https://jsonapi.org/format/#fetching-pagination
 */
export interface IJsonapiPaginationLinks extends IJsonapiAbstractLinks {
  first?: IJsonapiLink | string;
  last?: IJsonapiLink | string;
  prev?: IJsonapiLink | string;
  next?: IJsonapiLink | string;
  [key: string]: IJsonapiLink | string | undefined;
}

export interface IJsonapiResourceLinks extends IJsonapiAbstractLinks {
  [key: string]: IJsonapiLink | string | undefined;
}

/**
 * @see https://jsonapi.org/format/#document-compound-documents
 */
export interface IJsonapiCompoundDoc {
  type: string;
  id?: string;
}

/**
 * @see https://jsonapi.org/format/#document-resource-object-linkage
 */
export interface IJsonapiResourceLinkage extends IJsonapiCompoundDoc {
  id: string;
}

export interface IJsonapiResourceAbstract {
  meta?: TJsonapiMeta;
  links?: IJsonapiResourceLinks;
  _index?: number;
}

/**
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 */
export interface IJsonapiRelationship extends IJsonapiResourceAbstract {
  data: IJsonapiResourceLinkage;
}
export interface IJsonapiDataRelationships {
  [key: string]: IJsonapiRelationship;
}

/**
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export interface IJsonapiDataAttributes {
  [key: string]: string;
}

export interface IJsonapiResource<T=IJsonapiDataAttributes> 
  extends IJsonapiCompoundDoc, IJsonapiResourceAbstract
{
  attributes?: T;
  relationships?: IJsonapiDataRelationships;
}

// RESPONSE SPECIFICATION //

export interface IJsonapiResponseResource<T=IJsonapiDataAttributes>
  extends IJsonapiResourceLinkage, IJsonapiResourceAbstract
{
  attributes: T;
  relationships?: IJsonapiDataRelationships;
}

export interface IJsonapiAbstractResponse extends IResponseRequirement {
  jsonapi?: IJsonapiMember;
}
export interface IJsonapiBaseResponse extends IJsonapiAbstractResponse {
  meta?: TJsonapiMeta;
  links?: IJsonapiPaginationLinks;
}
export interface IJsonapiMetaResponse extends IJsonapiBaseResponse {
  meta: TJsonapiMeta;
}
export interface IJsonapiDataResponse extends IJsonapiBaseResponse {
  data: IJsonapiResponseResource[] | IJsonapiResponseResource | IJsonapiResourceLinkage | null;
  included?: Record<string, string>[];
}
export interface IJsonapiErrorResponse extends IJsonapiBaseResponse {
  errors: IJsonapiError[];
}

/**
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface IJsonapiResponse extends IJsonapiBaseResponse {
  data?: IJsonapiResource[] | IJsonapiResource | IJsonapiResourceLinkage | null;
  errors?: IJsonapiError[];
  included?: Record<string, string>[];
}

// REQUEST SPECIFICATION //

export interface IJsonapiRequestResource<T=IJsonapiDataAttributes>
  extends IJsonapiResourceAbstract, IJsonapiCompoundDoc
{
  attributes: T;
  relationships?: IJsonapiDataRelationships;
}

export interface IJsonapiAbstractRequest {
  jsonapi?: IJsonapiMember;
}

export interface IJsonapiRequest<T=IJsonapiDataAttributes>
  extends IJsonapiAbstractRequest
{
  data: IJsonapiRequestResource<T>;
}
