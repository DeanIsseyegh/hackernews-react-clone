import React, {Component} from 'react';
import './App.css';
import {sortBy} from 'lodash';

const largeColumn = {
  width: '40%',
};
const midColumn = {
  width: '30%',
};
const smallColumn = {
  width: '10%',
};

const DEFAULT_PAGE = 0;
const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
  isSortReverse: false
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {searchTerm: DEFAULT_QUERY, results: null, searchKey: '', sortKey: 'NONE', isSortReverse: false};
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({sortKey, isSortReverse});

  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
  }

  needsToSearchTopstories(searchTerm) {
    return (!this.state.results[searchTerm])
  }

  onSearchSubmit(event) {
    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    if (this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }
    event.preventDefault();
  }

  fetchSearchTopstories(searchTerm, page) {
    this.setState({isLoading: true});
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
      .catch(e => e);
  }

  setSearchTopstories(result) {
    const {hits, page} = result;
    const {searchKey, results} = this.state;
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [...oldHits, ...hits];
    this.setState(
      {
        result: {hits: updatedHits, page},
        results: {
          ...results,
          [searchKey]: {hits: updatedHits, page}
        },
        isLoading: false
      }
    );
  }

  onDismiss(id) {
    const {searchKey, results} = this.state;
    const {hits, page} = results[searchKey];
    const updatedHits = hits.filter(item => item.objectID !== id);
    this.setState({
      results: {...results, [searchKey]: {hits: updatedHits, page}}
    });
  }

  onSearchChange(e) {
    this.setState({
      searchTerm: e.target.value
    });
  }

  render() {
    const {searchTerm, results, searchKey, isLoading, sortKey, isSortReverse} = this.state;
    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;
    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];
    console.log(results);
    return (
      <div className="page">
        <div className="interactions">
          <Search onSearchChange={this.onSearchChange} value={searchTerm} onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        <Table onDismiss={this.onDismiss} list={list} sortKey={sortKey} onSort={this.onSort}
               isSortReverse={isSortReverse}/>
        <div className="interactions">
          <ButtonWithLoading isLoading={isLoading} onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

const Table = ({list, onDismiss, sortKey, onSort, isSortReverse}) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse
    ? sortedList.reverse()
    : sortedList;
  return (
    <div className="table">
      <div className="table-header">
        <span style={midColumn}>
          <Sort
            sortKey={'TITLE'}
            onSort={onSort}
            activeSortKey={sortKey}
          > Title
          </Sort>
        </span>
        <span style={smallColumn}>
          <Sort
            sortKey={'AUTHOR'}
            onSort={onSort}
            activeSortKey={sortKey}
          > Author
          </Sort>
        </span>
        <span style={smallColumn}>
          <Sort
            sortKey={'COMMENTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          > Comments
          </Sort>
        </span>
        <span style={smallColumn}>
          <Sort
            sortKey={'POINTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          > Points
          </Sort>
        </span>
      </div>
      {
        reverseSortedList.map(item =>
          <div key={item.objectID} className="table-row">
            <span style={largeColumn}>
                <a href={item.url}>{item.title}</a>
            </span>
            <span style={midColumn}>{item.author}</span>
            <span style={smallColumn}>{item.num_comments}</span>
            <span style={smallColumn}>{item.points}</span>
            {/*<span style={smallColumn}>*/}
            <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>
              Dismiss
            </Button>
            {/*</span>*/}
          </div>)
      }
    </div>
  );
};

const Search = ({searchValue, onSearchChange, children, onSubmit}) => {
  return (
    <form onSubmit={onSubmit}>
      {children}
      <input value={searchValue} onChange={onSearchChange} type="text"/>
      <button>Submit</button>
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

const Loading = () => {
  return (
    <div>
      Loading...
    </div>
  );
};

const Sort = ({sortKey, onSort, children, activeSortKey}) => {

  const sortClass = ['button-inline'];
  if (sortKey === activeSortKey) {
    sortClass.push('button-active');
  }
  return (<Button onClick={() => onSort(sortKey)}
                  className={sortClass.join(' ')}>
    {children}
  </Button>)
}


const withLoading = (Component) => ({isLoading, ...rest}) => isLoading ? <Loading/> : <Component {...rest} />;


const ButtonWithLoading = withLoading(Button);

export default App;
export {Button, Search, Table};