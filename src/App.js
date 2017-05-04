import React, { Component } from 'react';
import { join, head, pick, path, map, range } from 'ramda';
import './App.css'

const API_KEY = process.env.REACT_APP_API_KEY;
const API_ROOT = 'https://www.googleapis.com/youtube/v3/channels';

const Counter = props => {
  const value = Number(props.value).toLocaleString();
  return (
    <div className="Counter-View">
      <span className="Counter-Icon"/>
      <span className="Counter-Value">
         <div className="Counter-Display">
        { map(char =>
          <div className="Counter-Roll" data-value={ char }  >
            { (char.charCodeAt(0) === 160)
              ? <span className="Counter-Space"> </span>
              : map(digit => <span className="Counter-Digit">{ digit }</span>, range(0, 10) )
            }
          </div>
        , value) }
        </div>
      </span>
    </div>
  )
}


class App extends Component {

  state = {
    isFetching: false,
    isError: false,
    username: 'pewdiepie',
    meta: {},
    statistics: {
      subscribers: 0,
    }
  }

  componentDidMount() {
    this.update();
    setInterval(() => this.update(), 2000);
  }

  update () {
    this.fetch()
      .then(res => res.json())
      .then(({ items }) => {

        if (!items.length) {
          return this.setState({
            isError: true,
            isFetching: false,
          })
        };

        const { id, statistics, snippet } = head(items);
        this.setState({
          isFetching: false,
          isError: false,
          id,
          meta: {
            ...pick(['title', 'description'], snippet),
            thumbnail: path(['thumbnails', 'default', 'url'], snippet)
          },
          statistics: {
            subscribers: statistics.subscriberCount,
          }
        });
      })
  }

  fetch () {
    const { username } = this.state;
    const params = `?part=statistics,snippet&forUsername=${username}&key=${API_KEY}`;
    const URL = join('/', [API_ROOT, params]);
    return fetch(URL);
  }

  _handleChange = event => {
    const { value } = event.target;
    this.setState({ username: value, isFetching: true });
  }

  render() {
    const { id, username, statistics, meta, isFetching, isError } = this.state;
    const { subscribers } = statistics;

    return (
      <div className="App-View">
        <div className="App-Meta">
          <div>
            <h1>{ meta.title }</h1>
            <h2>{ meta.description }</h2>
          </div>
          <div>
            <img src={ meta.thumbnail } alt={ meta.title }/>
          </div>
        </div>
        <div className="App-Counter">
          <a target="_blank" href={ `https://youtube.com/channel/${id}` }>
            <Counter value={ subscribers } />
          </a>
        </div>
        <div className="App-Input">
          <input type="text" data-is-error={ isError } onChange={ this._handleChange } value={ username } />
          <div className="Spinner" style={ { visibility: isFetching ? 'visible' : 'hidden' } }/>
        </div>
      </div>
    );
  }
}

export default App;
