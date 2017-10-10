import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as ItemListState from '../store/ItemList';
import TextField from 'material-ui/TextField';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';

type ItemListStateProps =
    ItemListState.ItemListState
    & typeof ItemListState.actionCreators
    & RouteComponentProps<{}>;

class ItemList extends React.Component<ItemListStateProps, {}> {
    componentWillMount() {
        this.props.requestItemList("");
        this.props.selectItem(undefined);
    }

    componentWillReceiveProps(nextProps: ItemListStateProps) {
        this.props.requestItemList(nextProps.query);
        this.props.selectItem(nextProps.selecteditem);
    }

    public render() {
        return (
            <div className="itemList">
                {this.renderItemList()}
            </div>
        );
    }

    private renderItemList() {
        const styles = {
            countStyle: {
                width: 50,
                'margin-left': 5
            },
            buttonStyle: {
                'margin-left': 5
            }
        };

        return (
            <div>
                <span>
                    <TextField
                        error={this.props.itemError !== ""? true : false}
                        placeholder="Pikachu"
                        label="Add a pokemon or item"
                        margin="normal"
                        onChange={this.onChange.bind(this)}
                        value= { this.props.query }
                    />
                    <TextField
                        style={styles.countStyle}
                        error={this.props.valueError !== "" ? true : false}
                        placeholder="0"
                        label={this.props.selecteditem ? (this.props.selecteditem.type === "Item" ? "Count" : "Level") : ""}
                        margin="normal"
                        type="number"
                        onChange={this.onValueChange.bind(this)}
                        value={this.props.value}
                    />
                    <Button raised color="primary" style={styles.buttonStyle} onClick={this.props.addItem.bind(this)}>
                        Add
                    </Button>
                </span>
                <List style={this.props.hidelist ? {} : { display: 'none' }}>
                    {this.props.list.map(item => {
                        return (
                            <ListItem button key={item.name} onClick={this.onClick.bind(this, item)}>
                                <ListItemText key={item.url} primary={item.name} />
                            </ListItem>
                        )
                    })}
                </List>
            </div>
        );
    }

    onChange(event: React.FormEvent<HTMLSelectElement>) {
        this.props.requestItemList(event.currentTarget.value);
    };

    onClick(item: ItemListState.Item) {
        this.props.selectItem(item);
    }

    onValueChange(event: React.FormEvent<HTMLSelectElement>) {
        this.props.selectValue(parseInt(event.currentTarget.value));
    }

    addItem(event: React.FormEvent<HTMLSelectElement>) {
        this.props.addItem();
    }
}

export default connect(
    (state: ApplicationState) => state.itemlist,
    ItemListState.actionCreators            
)(ItemList) as typeof ItemList;