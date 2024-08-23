export const idlFactory = ({ IDL }) => {
  const PageId = IDL.Nat;
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'createPage' : IDL.Func([IDL.Text], [PageId], []),
    'deletePage' : IDL.Func([PageId], [Result], []),
    'getPage' : IDL.Func(
        [PageId],
        [
          IDL.Opt(
            IDL.Record({
              'id' : PageId,
              'title' : IDL.Text,
              'blocks' : IDL.Vec(
                IDL.Record({ 'content' : IDL.Text, 'type' : IDL.Text })
              ),
            })
          ),
        ],
        ['query'],
      ),
    'getPages' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'id' : PageId,
              'title' : IDL.Text,
              'blocks' : IDL.Vec(
                IDL.Record({ 'content' : IDL.Text, 'type' : IDL.Text })
              ),
            })
          ),
        ],
        ['query'],
      ),
    'updatePage' : IDL.Func(
        [
          PageId,
          IDL.Text,
          IDL.Vec(IDL.Record({ 'content' : IDL.Text, 'type' : IDL.Text })),
        ],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
