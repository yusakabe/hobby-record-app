import React from 'react'
import styled from 'styled-components'
import * as color from './color'
import { Button, ConfirmButton } from './Button'

export function AddCategoryDialog({
  value,
  onChange,
  onConfirm,
  onCancel,
  className,
}: {
  value: string
  onChange?(value: string): void
  onConfirm?(): void
  onCancel?(): void
  className?: string
}) {
  const disabled = !value?.trim()

  return (
    <Container className={className}>
      <Message>Input new category name</Message>
      <Input
        value={value}
        onChange={ev => onChange?.(ev.currentTarget.value)}
      />
      <ButtonRow>
        <AddButton
          disabled={disabled}
          onClick={onConfirm}
        />
        <CancelButton autoFocus onClick={onCancel} />
      </ButtonRow>
    </Container>
  )
}

const Container = styled.div`
  min-width: 350px;
  box-shadow: 0 8px 12px hsla(0, 0%, 0%, 0.2);
  border: solid 1px ${color.Silver};
  border-radius: 4px;
  background-color: ${color.White};
`

const Message = styled.div`
  padding: 16px;
  color: ${color.Black};
  font-size: 14px;
  line-height: 1.7;
`

const Input = styled.textarea`
  width: 90%;
  margin-left: 16px;
  margin-bottom: 8px;
  border: solid 1px ${color.Silver};
  border-radius: 3px;
  background-color: ${color.White};
  font-size: 14px;

  :focus {
    outline: none;
    border-color: ${color.Blue};
  }
`

const ButtonRow = styled.div`
  display: flex;
  padding: 0 16px 16px;

  > :not(:first-child) {
    margin-left: 8px;
  }
`

const AddButton = styled(ConfirmButton).attrs({
  children: 'Add',
})``

const CancelButton = styled(Button).attrs({
  children: 'Cancel',
})``
