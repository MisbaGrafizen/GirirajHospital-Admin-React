import React from 'react';

const SvgIcon = (props) => {
  const { iconId, ...res } = props;
  return (
    <svg {...res}>
      <use href={`${import.meta.env.BASE_URL}svg/sprite.svg#${iconId}`}></use>
    </svg>
  );
};

export default SvgIcon;

