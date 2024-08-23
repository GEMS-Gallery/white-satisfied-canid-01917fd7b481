import Hash "mo:base/Hash";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Order "mo:base/Order";

actor {
  // Types
  type PageId = Nat;
  type Block = {
    type_: Text;
    content: Text;
  };
  type Page = {
    id: PageId;
    title: Text;
    blocks: [Block];
  };

  // Stable storage
  stable var pageEntries : [(PageId, Page)] = [];
  var pages = HashMap.HashMap<PageId, Page>(0, Nat.equal, Nat.hash);

  // Initialize pages from stable storage
  pages := HashMap.fromIter<PageId, Page>(pageEntries.vals(), pageEntries.size(), Nat.equal, Nat.hash);

  stable var nextPageId : Nat = 0;

  // Helper function to convert Page to serializable format
  func serializePage(page : Page) : {
    id : PageId;
    title : Text;
    blocks : [{type_: Text; content: Text}];
  } {
    {
      id = page.id;
      title = page.title;
      blocks = Array.map(page.blocks, func(block : Block) : {type_: Text; content: Text} {
        {type_ = block.type_; content = block.content}
      });
    }
  };

  // Create a new page
  public func createPage(title : Text) : async PageId {
    let id = nextPageId;
    nextPageId += 1;
    let newPage : Page = {
      id = id;
      title = title;
      blocks = [{type_ = "text"; content = ""}];
    };
    pages.put(id, newPage);
    id
  };

  // Get all pages
  public query func getPages() : async [{
    id : PageId;
    title : Text;
    blocks : [{type_: Text; content: Text}];
  }] {
    Array.map<(PageId, Page), {
      id : PageId;
      title : Text;
      blocks : [{type_: Text; content: Text}];
    }>(Array.sort(Iter.toArray(pages.entries()), func(a : (PageId, Page), b : (PageId, Page)) : Order.Order { 
      Nat.compare(a.0, b.0)
    }), func((_, page)) {
      serializePage(page)
    })
  };

  // Get a specific page
  public query func getPage(id : PageId) : async ?{
    id : PageId;
    title : Text;
    blocks : [{type_: Text; content: Text}];
  } {
    Option.map(pages.get(id), serializePage)
  };

  // Update a page
  public func updatePage(id : PageId, title : Text, blocks : [{type_: Text; content: Text}]) : async Result.Result<(), Text> {
    switch (pages.get(id)) {
      case (null) {
        #err("Page not found")
      };
      case (?existingPage) {
        let updatedPage : Page = {
          id = id;
          title = title;
          blocks = Array.map(blocks, func(b : {type_: Text; content: Text}) : Block {
            {type_ = b.type_; content = b.content}
          });
        };
        pages.put(id, updatedPage);
        #ok()
      };
    }
  };

  // Delete a page
  public func deletePage(id : PageId) : async Result.Result<(), Text> {
    switch (pages.remove(id)) {
      case (null) {
        #err("Page not found")
      };
      case (?_) {
        #ok()
      };
    }
  };

  // System functions for upgrades
  system func preupgrade() {
    pageEntries := Iter.toArray(pages.entries());
  };

  system func postupgrade() {
    pageEntries := [];
  };
}
