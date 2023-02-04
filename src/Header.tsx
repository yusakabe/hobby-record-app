import React from 'react'
import styled from 'styled-components'
import * as color from './color'
import { PlusIcon } from './icon'

export function Header({
  className,
  onAddCategoryClick,
}: {
  className?: string
  onAddCategoryClick?(): void
}) {
  return (
    <Container className={className}>
      <Logo>趣味記録アプリ</Logo>
      <AddButton onClick={onAddCategoryClick} />
      <AddButtonArea>
        Add Category
      </AddButtonArea>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: ${color.Gray};
`

const Logo = styled.div`
  color: ${color.White};
  font-size: 16px;
  font-weight: bold;
`

const AddButtonArea = styled.div`
  margin-left: 5px;
  color: ${color.White};
  font-size: 13px;
`
const AddButton = styled.button.attrs({
  type: 'button',
  children: <PlusIcon />,
})`
  margin-left: auto;
  color: ${color.Black};

  :hover {
    color: ${color.Blue};
  }
`
