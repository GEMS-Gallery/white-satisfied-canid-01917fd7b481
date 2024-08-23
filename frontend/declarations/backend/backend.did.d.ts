import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type PageId = bigint;
export type Result = { 'ok' : null } |
  { 'err' : string };
export interface _SERVICE {
  'createPage' : ActorMethod<[string], PageId>,
  'deletePage' : ActorMethod<[PageId], Result>,
  'getPage' : ActorMethod<
    [PageId],
    [] | [
      {
        'id' : PageId,
        'title' : string,
        'blocks' : Array<
          { 'content' : string, 'type' : string, 'language' : [] | [string] }
        >,
      }
    ]
  >,
  'getPages' : ActorMethod<
    [],
    Array<
      {
        'id' : PageId,
        'title' : string,
        'blocks' : Array<
          { 'content' : string, 'type' : string, 'language' : [] | [string] }
        >,
      }
    >
  >,
  'updatePage' : ActorMethod<
    [
      PageId,
      string,
      Array<
        { 'content' : string, 'type' : string, 'language' : [] | [string] }
      >,
    ],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
