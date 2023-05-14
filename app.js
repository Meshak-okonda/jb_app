const path = require('path');
const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cors = require('cors');
const methodOverride = require('method-override');
const fileUpload = require("express-fileupload");
const { existsSync } = require("fs");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const compression = require("compression");

const sql = require("./database/mysql");

env.config();
const { PORT, SOCKET_PORT } = process.env;

app.use(cors());
app.use(compression());
app.use(methodOverride("_method"));

sql.connect();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
  session({
    secret: (process.env.SESSION_SECRET = "secret"),
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

const adminRoutes = require("./routes/admin");
const staffRoutes = require("./routes/staff");
const studentRoutes = require("./routes/student");
const homeRoutes = require("./routes/home");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.json());
app.use(cookieParser());

app.get("/files/:file_name", (req, res) => {
  const { file_name } = req.params;
  const filePath = path.join(__dirname, "public", "diplomes", file_name);
  if (!existsSync(filePath)) {
    return res.status(404).sendFile("public/assets/circle-stripe-1.png");
  }
  console.log(filePath);
  res.sendFile(filePath);
});

app.use("/admin", adminRoutes);
app.use("/staff", staffRoutes);
app.use("/student", studentRoutes);
app.use("/", homeRoutes);

// Home Page
app.use(homeRoutes);

function onNewWebsocketConnection(socket) {
  console.info(`Socket ${socket.id} has connected.`);
  //onlineClients.add(socket.id);

  socket.on("disconnect", () => {
    console.info(`Socket ${socket.id} has disconnected.`);
  });

  socket.on("back_to_server", (msg) => {
    console.info(`Socket ${socket.id} says: "${msg}"`);
    socket.emit("server_to_admin", msg);
  });
}

io.on("connection", onNewWebsocketConnection);

server.listen(PORT || 5000, () => {
  console.log(`Server started @ ${PORT || 5000}`);
  console.log(`Socket App listen on : ws://localhost:${PORT || 5000}`);
});

