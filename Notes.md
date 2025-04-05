# WebRTC & Peer Connection - Detailed Summary

## **1. What is `this.peer` in `PeerService`?**  
- `this.peer` is an instance of `RTCPeerConnection`.  
- It represents the WebRTC connection, which handles media streams and network traversal.  
- It includes **ICE candidate gathering(may or may not)**, **SDP (Session Description Protocol) negotiation**, and **peer-to-peer communication**.  

---

## **2. What happens in `getOffer()`?**  

```js
async getOffer() {
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
}
```

### **Step-by-Step Breakdown:**  
1. **`createOffer()`**  
   - Asks WebRTC to create an SDP (Session Description Protocol) offer.  
   - This contains media configuration, codecs, and network capabilities.  

2. **`setLocalDescription(offer)`**  
   - Why Use new RTCSessionDescription(offer)?
      RTCSessionDescription is a wrapper for the SDP offer.
      It ensures that the SDP structure is correctly formatted before passing it to setLocalDescription().
      However, in modern WebRTC, you don't always need to wrap it manually.
   - Sets the local description of the peer connection to the newly created offer.
   - Saves the offer as the local description.  
   - This **triggers ICE candidate gathering(definitely start gathering)**.  

3. **Returns the Offer**  
   - The offer is sent to the remote peer to initiate a connection.  

---

## **3. Where is our device’s IP address stored?**  
- **ICE Candidates**: The IP addresses (local/private/public) are included in **ICE candidates**.  
- **SDP Offer**:  
  - The SDP offer itself **can** include private/local IPs in some cases.  
  - However, **public IPs do not appear in the SDP** unless an ICE candidate provides them.  

---

## **4. How does ICE gathering start?**  
- **ICE gathering starts automatically** when a `RTCPeerConnection` is created.  
- However, some browsers **delay gathering** until `setLocalDescription(offer)` is called.  
- ICE candidates are gathered and emitted via `onicecandidate` events.  

---

## **5. What happens when we call `socket.connect()`?**  
- The client initiates a **WebSocket connection** with the server.  
- The server acknowledges the connection, allowing real-time communication.  

---

## **6. What happens if we write `socket.to(roomId).emit()`?**  
- **Broadcasts a message to all clients in the room**, except the sender.  
- If you want **everyone (including sender) to receive the message**, use `io.to(roomId).emit()`.  

---

## **7. What happens if we don’t remove a listener inside `useEffect`?**  
- The event listener will keep stacking up on every render, causing **memory leaks** and **duplicate event triggers**.  
- **Solution**: Always use `socket.off("event", callback)` inside the cleanup function in `useEffect`.  

---

## **8. What happens when we reload the page?**  
- The WebSocket connection is lost and needs to be re-established.  
- If a peer reloads, they need to **rejoin the room** and reinitialize their media streams.  

---

## **9. Why does `NotReadableError: Could not start video source` occur?**  
- **Cause**: Another application or tab is already using the camera.  
- **Solution**:  
  - Ensure no other application (like Zoom, Google Meet) is using the camera.  
  - Try closing other tabs or restarting the browser.  

---

# **Best Practices in `useEffect`**  

## **What Happens If You Don't Remove a Listener in `useEffect`?**
If you create a listener inside `useEffect` but don’t remove it, you will end up with multiple event listeners being added every time the component re-renders or re-mounts. This can lead to:

✅ Duplicate event calls (Multiple listeners responding to the same event).
🐛 Memory leaks (Old listeners remain even when the component unmounts).
🐌 Performance issues (Too many unnecessary listeners running).

---

---

## **5. What happens when we call `socket.connect()`?**  
- The client initiates a **WebSocket connection** with the server.  
- The server acknowledges the connection, allowing real-time communication.  

---

## **6. What happens if we write `socket.to(roomId).emit()`?**  
- **Broadcasts a message to all clients in the room**, except the sender.  
- If you want **everyone (including sender) to receive the message**, use `io.to(roomId).emit()`.  

---

## **7. What happens if we don’t remove a listener inside `useEffect`?**  
- The event listener will keep stacking up on every render, causing **memory leaks** and **duplicate event triggers**.  
- **Solution**: Always use `socket.off("event", callback)` inside the cleanup function in `useEffect`.  


## **8. What happens when we reload the page?**  
- The WebSocket connection is lost and needs to be re-established.  
- If a peer reloads, they need to **rejoin the room** and reinitialize their media streams.  

---

## **10. WebRTC Learning Resource**
For a better understanding of WebRTC, watch this video: [WebRTC Video Guide](https://www.youtube.com/watch?v=pGAp5rxv6II)

---