// const express = require("express");
// const bodyParser = require("body-parser");
// const { Product, Store } = require("./models/store");
// const port = 3000
// const app = express()

// app.get("/store/home", (req, res) => {
//     res.status(200).send({ 'mensaje': 'Im in home' })
// })
// app.use(bodyParser.urlencoded({extended:true}))
// app.use(bodyParser.json())
// app.get("/",(req,res)=>{
//     res.send({message:"Server on"})
// });
// app.post("/create/product",(req,res)=>{
//     const {name,price,stock}=req.body
//     console.log(req.body)
//     const newProduct=Product({name,price,stock})
//     newProduct.save((err,Product)=>{
//         err
//         ?res.status(409).send(err)
//         :res.status(201).send(Product)
//     })
// });
// app.post("/store", (req,res)=>{
//     const {store_name,direction,products}=req.body
//     const newStore =Store({store_name,direction,products})
//     newStore.save((err,Store)=>{
//         err
//         ?res.status(409).send(err)
//         :res.status(201).send(Store)
//     })
// });
// app.get("/store/:idStore", (req,res)=>{
//     const {idStore}=req.params
//     Store.findById(idStore).populate(`products`).exec().then(Store=>res.send(Store)).catch(err=>res.status(409).send(err))
// });
// app.get("/product/id:Product",(req,res)=>{
//     const{id:Product}=req.params
//     Product.findById(idProduct).exec().then(products=>products ?res.send(products):res.status(404).send({message:"products"})).catch(err=>res.status(409).send(err))
// })
// app.get("/all/products",(req,res)=>{
//     Product.find().exec().then(products=>res.send(products)).catch(err=>res.status(409).send(err))
// })
// app.listen(port, () => {
//     console.log(`Server on port ${port}`)
// })

const mongoose = require('mongoose');
const URL = "mongodb+srv://EiichiMS:chorrillo@eiichim-ossme.mongodb.net/test?retryWrites=true&w=majority";
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.port || 3000;
mongoose.connect(URL, () => { console.log("----- Base de Datos Conectada -----") });

const articuloSchema = mongoose.Schema({
    articulo: mongoose.Schema.ObjectId,
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    existencias: { type: Number, default: 10 }
});

const ticketSchema = mongoose.Schema({
    ticket: mongoose.Schema.ObjectId,
    subtotal: { type: Number, default: 0 },
    iva: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    articulos: [{ type: mongoose.Schema.ObjectId, ref: 'Articulo', required: true }]
});

const Articulo = mongoose.model('Articulo', articuloSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).send("GET Exitoso!");
});

app.post('/api/articulos/', (req, res) => {
    const jsonCliente = req.body;

    const nuevoArticulo = Articulo(jsonCliente);

    nuevoArticulo.save((error, articulo) => {
        res.status(201).send(articulo);
    });
});

app.get('/api/articulos/', (req, res) => {
    Articulo.find().exec().then(listaArticulos => res.status(200).send(listaArticulos)).catch(error => res.status(400).send(error));
});

app.get('/api/articulos/:id/', (req, res) => {
    const articuloId = req.params.id;
    Articulo.findById(articuloId).exec().then(articulo => res.status(200).send(articulo)).catch(error => res.status(404).send(error));
});

app.put('/api/articulos/:id/', (req, res) => {
    const articuloId = req.params.id;
    Articulo.findByIdAndUpdate(articuloId, { $set: req.body }, { new: true }).exec().then(articuloActualizado => res.status(200).send(articuloActualizado)).catch(error => res.status(400).send(error));
});

app.delete('/api/articulos/:id/', (req, res) => {
    const articuloId = req.params.id;
    Articulo.findByIdAndDelete(articuloId).exec().then(articulo => res.status(204).send('Artículo eliminado exitosamente.')).catch(error => res.status(404).send(error));
});


app.post('/api/tickets/', (req, res) => {
    const jsonCliente = req.body
    const nuevoTicket = Ticket(jsonCliente);
    nuevoTicket.save((error, ticket) => {
        res.status(201).send(ticket);
    });
});

app.get('/api/tickets/', (req, res) => {
    Ticket.find().populate('articulos').exec().then(listaTickets => res.status(200).send(listaTickets)).catch(error => res.status(400).send(error));
});

app.get('/api/tickets/:id/', (req, res) => {
    const ticketId = req.params.id;
    Ticket.findById(ticketId).populate('articulos').exec().then(ticket => res.status(200).send(ticket)).catch(error => res.status(404).send(error));
});

app.put('/api/tickets/:id/', (req, res) => {
    const ticketId = req.params.id;
    Ticket.findByIdAndUpdate(ticketId, { $set: req.body }, { new: true }).exec().then(ticketActualizado => res.status(200).send(ticketActualizado)).catch(error => res.status(400).send(error));
});

app.delete('/api/tickets/:id/', (req, res) => {
    const ticketId = req.params.id;
    Ticket.findByIdAndDelete(ticketId).exec().then(ticket => res.status(204).send('Ticket eliminado exitosamente.')).catch(error => res.status(404).send(error));
}); app.get('/api/tickets/factura/:id/', (req, res) => {

    const ticketId = req.params.id;
    let subtotal = 0, iva = 0, total = 0;

    Ticket.findById(ticketId).populate('articulos').exec().then(ticket => {
        ticket.articulos.map(articulo => {
            subtotal += articulo.precio
        });
        iva = (subtotal * 0.16);
        total = subtotal + iva;
        Ticket.findByIdAndUpdate(ticket._id, { subtotal: subtotal, iva: iva, total: total }, { new: true }).populate('articulos').exec().then(ticketCalculado => res.status(200).send(ticketCalculado)).catch(error => res.status(404).send(error));
    }).catch(error => res.status(400).send(error));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});