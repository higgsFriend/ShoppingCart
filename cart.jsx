// simulate getting products from DataBase
const products = [
  { name: "apples", country: "Italy", cost: 3, instock: 10 },
  { name: "oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "beans", country: "USA", cost: 2, instock: 5 },
  { name: "cabbage", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    let instock = item[0].instock;
    if (instock > 0) {
      console.log(`add to Cart ${JSON.stringify(item)}`);

      console.log(`instock: ${instock}`);
      let newitems = items.map((item) => {
        if (item.name == name) {
          item.instock = item.instock - 1;
        }
        return item;
      });
      setItems(newitems);
      setCart([...cart, ...item]);
      //doFetch(query);
    }
    else {
      window.alert("Sorry mate out of stock.");
    }
  };
  const deleteCartItem = (index) => {
    let removedItemName = cart[index].name;
    let newCart = cart.filter((item, i) => index != i);
    console.log(`Add this back to inventory: ${removedItemName}`);
    let newItems = items.map((item) => {
      if (item.name == removedItemName) {
        item.instock = item.instock + 1;
      }
      return item;
    });
    setCart(newCart);
    setItems(newItems);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={photos[index % 4]} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name} ${item.cost}, Inventory: {item.instock}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    let newStockItems = data.data.map((item) => {
      let item_attributes = item['attributes'];
      let { name, country, cost, instock } = item_attributes;
      return { name, country, cost, instock };
    });
    console.log(`New items: ${JSON.stringify(newStockItems)}`);
    console.log(`Old items: ${JSON.stringify(items)}`);
    let addStock = [];
    // Loop through current innventory and update it
    let newItems = items.map((item)=>{
      console.log(`*** ${item.name}, current stock is ${item.instock}`);
      addStock = newStockItems.filter((stockItem) => {
        console.log(`Restocking check: ${stockItem.name} ${typeof stockItem.name} vs ${item.name} ${typeof item.name}`);
        if (stockItem.name == item.name) {
          console.log(`Hell yeah! ${stockItem.name} is a match!  Add ${stockItem.instock} items.`);
          return stockItem;
        }
      });
      console.log(`** ${item.name}:${item.instock} + ${JSON.stringify(addStock[0])}`);

      item.instock = item.instock + addStock[0].instock;
      return item;
    });
    console.log('newItems:' + JSON.stringify(newItems));
    setItems(newItems);

  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
