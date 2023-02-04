import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import * as color from "./color";
import { Button, ConfirmButton } from "./Button";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ja from "date-fns/locale/ja";

export function InputForm({
  value,
  onChange,
  onConfirm,
  onCancel,
  className,
}: {
  value?: {
    date: string;
    title: string;
    text?: string;
  };
  onChange?(value: { date: string; title: string; text?: string }): void;
  onConfirm?(value: { date: string; title: string; text?: string }): void;
  onCancel?(): void;
  className?: string;
}) {
  const checkDisabled = () => {
    setDisabled(!title.trim());
  };

  const handleConfirm = () => {
    if (disabled) return;
    value = {
      date: date.toLocaleDateString(),
      title: title,
      text: text,
    };
    onConfirm?.(value);
    setDate(today);
    setTitle("");
    setText("");
  };

  const ref = useAutoFitToContentHeight(value?.text);
  registerLocale("ja", ja);

  const [disabled, setDisabled] = React.useState(true);
  const today = new Date();
  const [date, setDate] = React.useState(new Date());
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");

  value = {
    date: date.toLocaleDateString(),
    title: title,
    text: text,
  };

  return (
    <Container className={className}>
      <ItemName>日付</ItemName>
      <DateInput>
        <DatePicker
          dateFormat="yyyy/MM/dd"
          locale="ja"
          selected={date}
          onChange={(selectedDate) => {
            setDate(selectedDate);
          }}
        />
      </DateInput>

      <ItemName>タイトル</ItemName>
      <TitleInput
        placeholder="Enter a title"
        value={title}
        onChange={(ev) => {
          setTitle(ev.target.value);
          checkDisabled();
        }}
      />

      <ItemName>メモ</ItemName>
      <NoteInput
        ref={ref}
        placeholder="Enter a note"
        value={text}
        onChange={(ev) => setText(ev.target.value)}
      />

      <ButtonRow>
        <AddButton disabled={disabled} onClick={handleConfirm} />
        <CancelButton onClick={onCancel} />
      </ButtonRow>
    </Container>
  );
}

const Container = styled.div``;

const ItemName = styled.div`
  font-size: 14px;
`;
const DateInput = styled.form`
  display: inline-block;
  margin-bottom: 8px;
  border: solid 1px ${color.Silver};
  border-radius: 3px;
  padding: 6px 8px;
  background-color: ${color.White};
  font-size: 14px;
  line-height: 1.7;

  :focus {
    outline: none;
    border-color: ${color.Blue};
  }
`;

const TitleInput = styled.textarea`
  display: block;
  width: 100%;
  margin-bottom: 8px;
  border: solid 1px ${color.Silver};
  border-radius: 3px;
  padding: 6px 8px;
  background-color: ${color.White};
  font-size: 14px;
  line-height: 1.7;

  :focus {
    outline: none;
    border-color: ${color.Blue};
  }
`;

const NoteInput = styled.textarea`
  display: block;
  width: 100%;
  margin-bottom: 8px;
  border: solid 1px ${color.Silver};
  border-radius: 3px;
  padding: 6px 8px;
  background-color: ${color.White};
  font-size: 14px;
  line-height: 1.7;

  :focus {
    outline: none;
    border-color: ${color.Blue};
  }
`;

const ButtonRow = styled.div`
  display: flex;

  > :not(:first-child) {
    margin-left: 8px;
  }
`;

const AddButton = styled(ConfirmButton).attrs({
  children: "Add",
})``;

const CancelButton = styled(Button).attrs({
  children: "Cancel",
})``;

/**
 * テキストエリアの高さを内容に合わせて自動調整する
 *
 * @param content テキストエリアの内容
 */
function useAutoFitToContentHeight(content: string | undefined) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(
    () => {
      const el = ref.current;
      if (!el) return;

      const { borderTopWidth, borderBottomWidth } = getComputedStyle(el);
      el.style.height = "auto"; // 一度 auto にしないと高さが縮まなくなる
      el.style.height = `calc(${borderTopWidth} + ${el.scrollHeight}px + ${borderBottomWidth})`;
    },
    // 内容が変わるたびに高さを再計算
    [content]
  );

  return ref;
}
