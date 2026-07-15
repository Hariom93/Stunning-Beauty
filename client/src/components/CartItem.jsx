import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const CartItem = ({ item, refresh }) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const updateQuantity = async (qty) => {
    try {
      await axios.put(
        `/api/cart/${item._id}`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async () => {
    try {
      await axios.delete(`/api/cart/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
      <img
        src={item.product.image || '/placeholder.png'}
        alt={item.product.name}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="flex-1 ml-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {item.product.name}
        </h3>
        <p className="text-primary font-bold">${item.product.price}</p>
        <div className="flex items-center mt-2">
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={() => updateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="mx-2">{item.quantity}</span>
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={() => updateQuantity(item.quantity + 1)}
          >
            +
          </button>
        </div>
      </div>
      <button
        className="text-red-500 hover:text-red-700 ml-4"
        onClick={removeItem}
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
};

export default CartItem;
