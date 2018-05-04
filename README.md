# My Heart is in the Bridge

## What does it do?

Anyone can access a heart rate monitor web application from their mobile
device, and see their heart beat on the Pausch Bridge in real time.

## Why did we make this?

The Pausch Bridge was created as both a metaphorical and physical connection
between the School of Drama and the School of Computer Science. Regardless of
discipline, every Carnegie Mellon student knows the saying, "My Heart is in the
Work." In this lighting display, we join the campus by displaying everyone's
heartbeat on the bridge. When enough users connect to our heartbeat display,
every panel on the bridge will pulse in unison, showcasing the harmony that
ensues when we come together for a common purpose.

## How do I run this?

This project is split into two distinct parts: The Python-based websocket
server, and the ReactJS-based heart rate client.

The server accepts real-time heart beat information from clients, and displays
the light show on the bridge.  It also includes a simulator to visualize the
light show without access to the bridge itself.

The client uses browser Javascript APIs to access the camera, and do the image
processing needed to detect heart beats. It sends them to the server in real
time.

### Running the server

This might be tricky. In order to access the camera through Javascript in
modern browsers, all remote connections must be secured with HTTPS, which means
this server will need to run with HTTPS. So you'll have to (1) get a domain,
(2) get an HTTPS certificate (Let's Encrypt works well for this), (3) move the
certificate to the Pausch Bridge server, and (4) run `./server/main.py`. Running
`main.py --help` gives all the information needed to configure the server at
runtime.

### Building the client

The client was bootstrapped with `create-react-app`. Run `npm run build` under
`./client/` to compile the ReactJS project, then serve the contents of
`./client/build/` on a static web server somewhere. This server will also need
HTTPS. Don't forget to change the server domain constant in
`./client/HRClient.js` if you use another domain name.
