import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (auctionId) => {
  const [socket, setSocket] = useState(null);
  const [liveBid, setLiveBid] = useState(null);
  const [error, setError] = useState(null);
  const [watchers, setWatchers] = useState(1);

  useEffect(() => {
    // Connect to the NGINX proxy (which routes to the backend WebSocket engine)
    const newSocket = io('/', { path: '/socket.io' });
    setSocket(newSocket);

    // Join the specific auction room
    newSocket.emit('join_auction', auctionId);

    // Listen for new bids broadcasted by the server
    newSocket.on('new_bid', (bidData) => {
      setLiveBid(bidData);
    });

    // Listen for real-time room viewer updates
    newSocket.on('update_watchers', (count) => {
      setWatchers(count || 1);
    });

    // Listen for any errors (like invalid bid amounts)
    newSocket.on('bid_error', (err) => {
      setError(err.error);
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    });

    // Cleanup: Disconnect when the user leaves the page
    return () => {
      newSocket.emit('leave_auction', auctionId);
      newSocket.disconnect();
    };
  }, [auctionId]);

  return { socket, liveBid, error, watchers };
};

export default useSocket;