import React, { useState } from "react";
import styled from "styled-components";
import * as color from "./color";
import { Card } from "./Card";
import { PlusIcon } from "./icon";
import { InputForm as _InputForm } from "./InputForm";
import { ItemID } from "./api";

export function Column({
  title,
  items: rawItems,
  onCardDragStart,
  onCardDrop,
  onCardDeleteClick,
  value,
  onValueChange,
  onTextConfirm,
  onTextCancel,
}: {
  title?: string;
  items?: {
    id: ItemID;
    date: string;
    title: string;
    text?: string;
  }[];
  onCardDragStart?(id: ItemID): void;
  onCardDrop?(entered: ItemID | null): void;
  onCardDeleteClick?(id: ItemID): void;
  value?: {
    date: string;
    title: string;
    text?: string;
  };
  onValueChange?(value: { date: string; title: string; text?: string }): void;
  onTextConfirm?(value: { date: string; title: string; text?: string }): void;
  onTextCancel?(): void;
}) {
  const items = rawItems;
  const totalCount = rawItems?.length ?? -1;

  const [inputMode, setInputMode] = useState(false);
  const toggleInput = () => setInputMode((v) => !v);
  const confirmInput = (value) => {
    onTextConfirm?.(value);
    setInputMode(false);
  };
  const cancelInput = () => {
    setInputMode(false);
    onTextCancel?.();
  };

  const [draggingItemID, setDraggingItemID] = useState<ItemID | undefined>(
    undefined
  );

  const handleCardDragStart = (id: ItemID) => {
    setDraggingItemID(id);
    onCardDragStart?.(id);
  };

  return (
    <Container>
      <Header>
        {totalCount >= 0 && <CountBadge>{totalCount}</CountBadge>}
        <ColumnName>{title}</ColumnName>

        <AddButton onClick={toggleInput} />
      </Header>

      {inputMode && (
        <InputForm
          value={value}
          onChange={onValueChange}
          onConfirm={confirmInput}
          onCancel={cancelInput}
        />
      )}
      {!items ? (
        <Nothing />
      ) : (
        <>
          <VerticalScroll>
            {items.map(({ id, date, title, text }, i) => (
              <Card.DropArea
                key={id}
                disabled={
                  draggingItemID !== undefined &&
                  (id === draggingItemID || items[i - 1]?.id === draggingItemID)
                }
                onDrop={() => onCardDrop?.(id)}
              >
                <Card
                  date={date}
                  title={title}
                  text={text}
                  onDragStart={() => handleCardDragStart(id)}
                  onDragEnd={() => setDraggingItemID(undefined)}
                  onDeleteClick={() => onCardDeleteClick?.(id)}
                />
              </Card.DropArea>
            ))}
            <Card.DropArea
              style={{ height: "100%" }}
              disabled={
                draggingItemID !== undefined &&
                items[items.length - 1]?.id === draggingItemID
              }
              onDrop={() => onCardDrop?.(null)}
            />
          </VerticalScroll>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  width: 355px;
  height: 100%;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  background-color: ${color.LightSilver};

  > :not(:last-child) {
    flex-shrink: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
`;

const CountBadge = styled.div`
  margin-right: 8px;
  border-radius: 20px;
  padding: 2px 6px;
  color: ${color.Black};
  background-color: ${color.Silver};
  font-size: 12px;
  line-height: 1;
`;

const ColumnName = styled.div`
  color: ${color.Black};
  font-size: 14px;
  font-weight: bold;
`;

const AddButton = styled.button.attrs({
  type: "button",
  children: <PlusIcon />,
})`
  margin-left: auto;
  color: ${color.Black};

  :hover {
    color: ${color.Blue};
  }
`;

const InputForm = styled(_InputForm)`
  padding: 8px;
`;

const Nothing = styled.div.attrs({
  children: "No item",
})`
  padding: 8px;
  font-size: 14px;
`;

const VerticalScroll = styled.div`
  height: 100%;
  padding: 8px;
  overflow-y: auto;
  flex: 1 1 auto;

  > :not(:first-child) {
    margin-top: 8px;
  }
`;
