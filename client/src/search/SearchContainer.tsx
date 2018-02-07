import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import * as SearchActions from "./SearchActions"
import { SearchState } from "./SearchReducer"
import debounce from "utils/debounce"
import SearchBar from "components/search/SearchBar"

interface DispatchProps {
  onQueryChange(query: string): void
  onFsNodeSearch(query: string): void
  onCancelSearch(): void
}

interface PropsState extends SearchState {
  directory: FsNode
}

type Props = PropsState & DispatchProps

class SearchContainer extends React.PureComponent<Props> {
  render() {
    const { query, onQueryChange, onCancelSearch } = this.props
    return (
      <SearchBar
        query={query}
        onChange={onQueryChange}
        onSubmit={this.handleOnSubbmit}
        onCancel={onCancelSearch}
      />
    )
  }

  handleOnSubbmit = debounce((query: string) => {
    this.props.onFsNodeSearch(query)
  }, 300)
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    ...state.search,
    directory: state.fileSystem.directory!,
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onQueryChange: query => dispatch(SearchActions.onQueryChange(query)),
    onFsNodeSearch: query => dispatch(SearchActions.onFsNodeSearch(query)),
    onCancelSearch: () => dispatch(SearchActions.onCancelSearch())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer)
