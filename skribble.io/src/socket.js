import { io } from "socket.io-client";


const socket = io("https://skribble-io-cfeb.onrender.com/");

export default socket;