// src/ListComponent.js
import React from 'react';
import PropTypes from 'prop-types'; // For prop type validation

function ListComponent({ items, renderItem, emptyListComponent }) {
  if (!items || items.length === 0) {
    return emptyListComponent ? emptyListComponent() : <p>No items to display.</p>;
  }

  return (
    <ul className="item-list">
      {items.map((item, index) => renderItem(item, index))}
    </ul>
  );
}

ListComponent.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  emptyListComponent: PropTypes.func, // Optional: component to render when list is empty
};

export default ListComponent;