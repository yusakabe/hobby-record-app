import React, { useState, useEffect } from "react";
import styled from "styled-components";
import produce from "immer";
import { randomID, sortBy, reorderPatch } from "./util";
import { api, CategoryID, ItemID } from "./api";
import { Header as _Header } from "./Header";
import { Column } from "./Column";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { DeleteDialog } from "./DeleteDialog";
import { Overlay as _Overlay } from "./Overlay";

type State = {
  categories?: {
    id: CategoryID;
    title?: string;
    value?: {
      date: string;
      title: string;
      text?: string;
    };
    items?: {
      id: ItemID;
      date: string;
      title: string;
      text?: string;
    }[];
  }[];
  itemsOrder: Record<string, ItemID | CategoryID>;
};

export function App() {
  const [{ categories, itemsOrder }, setData] = useState<State>({
    itemsOrder: {},
  });

  useEffect(() => {
    (async () => {
      const categories = await api("GET /v1/categories", null);

      setData(
        produce((draft: State) => {
          draft.categories = categories;
        })
      );

      const [unorderedItems, itemsOrder] = await Promise.all([
        api("GET /v1/items", null),
        api("GET /v1/itemsOrder", null),
      ]);

      setData(
        produce((draft: State) => {
          draft.itemsOrder = itemsOrder;
          draft.categories?.forEach((category) => {
            category.items = sortBy(unorderedItems, itemsOrder, category.id);
          });
        })
      );
    })();
  }, []);

  const [draggingItemID, setDraggingItemID] = useState<ItemID | undefined>(
    undefined
  );

  const dropItemTo = (toID: ItemID | CategoryID) => {
    const fromID = draggingItemID;
    if (!fromID) return;

    setDraggingItemID(undefined);

    if (fromID === toID) return;

    const patch = reorderPatch(itemsOrder, fromID, toID);

    setData(
      produce((draft: State) => {
        draft.itemsOrder = {
          ...draft.itemsOrder,
          ...patch,
        };

        const unorderedItems =
          draft.categories?.flatMap((c) => c.items ?? []) ?? [];
        draft.categories?.forEach((category) => {
          category.items = sortBy(
            unorderedItems,
            draft.itemsOrder,
            category.id
          );
        });
      })
    );

    api("PATCH /v1/itemsOrder", patch);
  };

  const setValue = (
    CategoryID: CategoryID,
    value: { date: string; title: string; text?: string }
  ) => {
    setData(
      produce((draft: State) => {
        const category = draft.categories?.find((c) => c.id === CategoryID);
        if (!category) return;

        category.value = value;
      })
    );
  };

  const [addCategoryDialogTogle, setAddCategoryDialogTogle] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const addCategory = () => {
    const categoryID = randomID() as CategoryID;

    const patch: Record<string, CategoryID | ItemID> = {};
    patch[categoryID] = categoryID;

    setData(
      produce((draft: State) => {
        draft.categories?.push({
          id: categoryID,
          title: newCategoryName,
        });

        draft.itemsOrder = {
          ...draft.itemsOrder,
          ...patch,
        };
      })
    );

    api("POST /v1/categories", {
      id: categoryID,
      title: newCategoryName,
    });
    api("PATCH /v1/itemsOrder", patch);

    setAddCategoryDialogTogle(false);
    setNewCategoryName("");
  };

  const addItem = (categoryID: CategoryID) => {
    const category = categories?.find((c) => c.id === categoryID);
    if (!category) return;

    const value = category.value;
    const itemID = randomID() as ItemID;

    const patch = reorderPatch(itemsOrder, itemID, itemsOrder[categoryID]);

    setData(
      produce((draft: State) => {
        const category = draft.categories?.find((c) => c.id === categoryID);
        if (!category?.items) return;

        category.items.unshift({
          id: itemID,
          date: category.value?.date ? category.value?.date : "",
          title: category.value?.title ? category.value?.title : "",
          text: category.value?.text,
        });
        if (category.value) {
          category.value.title = "";
        }
        draft.itemsOrder = {
          ...draft.itemsOrder,
          ...patch,
        };
      })
    );

    api("POST /v1/items", {
      id: itemID,
      date: value?.date ? value?.date : "",
      title: value?.title ? value?.title : "",
      text: value?.text,
    });
    api("PATCH /v1/itemsOrder", patch);
  };

  const [deletingItemID, setDeletingItemID] = useState<ItemID | undefined>(
    undefined
  );

  const deleteCard = () => {
    const ItemID = deletingItemID;
    if (!ItemID) return;

    setDeletingItemID(undefined);

    const patch = reorderPatch(itemsOrder, ItemID);

    setData(
      produce((draft: State) => {
        const category = draft.categories?.find((col) =>
          col.items?.some((c) => c.id === ItemID)
        );
        if (!category?.items) return;

        category.items = category.items.filter((c) => c.id !== ItemID);

        draft.itemsOrder = {
          ...draft.itemsOrder,
          ...patch,
        };
      })
    );

    api("DELETE /v1/item", {
      id: ItemID,
    });
    api("PATCH /v1/itemsOrder", patch);
  };

  return (
    <Container>
      <Header onAddCategoryClick={() => setAddCategoryDialogTogle(true)} />
      <MainArea>
        <HorizontalScroll>
          {!categories ? (
            <Loading />
          ) : (
            categories.map(({ id: categoryID, title, items, value }) => (
              <Column
                key={categoryID}
                title={title}
                items={items}
                onCardDragStart={(itemID) => setDraggingItemID(itemID)}
                onCardDrop={(entered) => dropItemTo(entered ?? categoryID)}
                onCardDeleteClick={(itemID) => setDeletingItemID(itemID)}
                value={value}
                onValueChange={(value) => setValue(categoryID, value)}
                onTextConfirm={(value) => {
                  setValue(categoryID, value);
                  addItem(categoryID);
                }}
              />
            ))
          )}
        </HorizontalScroll>
      </MainArea>
      {addCategoryDialogTogle && (
        <Overlay>
          <AddCategoryDialog
            value={newCategoryName}
            onChange={(value) => setNewCategoryName(value)}
            onConfirm={() => addCategory()}
            onCancel={() => setAddCategoryDialogTogle(false)}
          />
        </Overlay>
      )}
      {deletingItemID && (
        <Overlay onClick={() => setDeletingItemID(undefined)}>
          <DeleteDialog
            onConfirm={deleteCard}
            onCancel={() => setDeletingItemID(undefined)}
          />
        </Overlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
`;

const Header = styled(_Header)`
  flex-shrink: 0;
`;

const MainArea = styled.div`
  height: 100%;
  padding: 16px 0;
  overflow-y: auto;
`;

const HorizontalScroll = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;

  > * {
    margin-left: 16px;
    flex-shrink: 0;
  }

  ::after {
    display: block;
    flex: 0 0 16px;
    content: "";
  }
`;
const Loading = styled.div.attrs({
  children: "Loading...",
})`
  font-size: 14px;
`;
const Overlay = styled(_Overlay)`
  display: flex;
  justify-content: center;
  align-items: center;
`;
