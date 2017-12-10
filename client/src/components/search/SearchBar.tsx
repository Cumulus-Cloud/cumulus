import * as React from "react"
import * as styles from "./SearchBar.css"
import SearchIcon from "icons/SearchIcon"

interface Props {
  query: string
  onChange: (query: string) => void
  onSubmit: (query: string) => void
  onCancel: () => void
}

export default class SearchBar extends React.PureComponent<Props> {
  render() {
    const { query } = this.props
    return (
      <div className={styles.searchBar}>
        <SearchIcon color="#6F6F6F" />
        <input
          className={styles.input}
          type="search"
          placeholder={Messages("ui.search")}
          value={query}
          onChange={this.handleOnQueryChange}
        />
      </div>
    )
  }

  handleOnQueryChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { onChange, onSubmit, onCancel } = this.props
    const query = e.currentTarget.value
    onChange(query)
    if (query) {
      onSubmit(query)
    } else {
      onCancel()
    }
  }
}
