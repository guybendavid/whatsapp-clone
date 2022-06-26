import { css } from "@emotion/css";

export const overflowHandler = (maxWidth: string) => css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: ${maxWidth};
`;

export const verticalOverflowHandler = (maxLines: number) => css`
  display:-webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${maxLines};
`;

export const baseSearchInputStyle = css`
  flex: 1;

  .input-wrapper {
    background: white;
    border-radius: 30px;

    .input-base {
      width: 100%;
    }
  }
`;