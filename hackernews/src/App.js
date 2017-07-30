import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  }, {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },];


const largeColumn = { width: '40%',
};
const midColumn = { width: '30%',
};
const smallColumn = { width: '10%',
};

function isSearched(searchTerm) {
  return function (item) {
    return !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {list};
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  onDismiss(id) {
    this.setState({
      list: this.state.list.filter(item => item.objectID !== id)
    });
  }

  onSearchChange(e) {
    this.setState({
      searchTerm: e.target.value
    });
  }

  render() {
    return (
      <div className="page">
        <div className="interactions">
          <Search onSearchChange={this.onSearchChange} value={this.state.searchTerm}>
            Search
          </Search>
        </div>
        <Table onDismiss={this.onDismiss} list={this.state.list} pattern={this.state.searchTerm}/>
      </div>
    );
  }
}

const Table = ({list, onDismiss, pattern}) => {
  return (
    <div className="table">
      {
        list.filter(isSearched(pattern)).map(item =>
          <div key={item.objectID} className="table-row">
            <span style={largeColumn}>
                <a href={item.url}>{item.title}</a>
            </span>
            <span style={midColumn}>{item.author}</span>
            <span style={smallColumn}>{item.num_comments}</span>
            <span style={smallColumn}>{item.points}</span>
            <span style={smallColumn}>
            <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>
              Dismiss
            </Button>
            </span>
          </div>)
      }
    </div>
  );
};

const Search = ({searchValue, onSearchChange, children}) => {
  return (
    <form>
      {children}
      <input value={searchValue} onChange={onSearchChange} type="text"/>
    </form>
  );
};

const Button = ({onClick, children, className = ''}) => {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};

export default App;
