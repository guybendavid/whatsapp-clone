import { css } from "@emotion/css";

export const getOverflowStyle = (maxWidth: string) => css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: ${maxWidth};
`;

export const getVerticalOverflowStyle = (maxLines: number) => css`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${maxLines};
  overflow: hidden;
  overflow-wrap: break-word;
`;

export const baseSearchInputStyle = css`
  flex: 1;

  & > div {
    &:first-child {
      background: white;
      border-radius: 30px;
    }

    .MuiInputBase-root {
      width: 100%;
    }
  }
`;
