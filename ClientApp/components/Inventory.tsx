import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as InventoryState from '../store/Inventory';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';

// At runtime, Redux will merge together...
type InventoryStateProps =
    InventoryState.InventoryListState        // ... state we've requested from the Redux store
    & typeof InventoryState.actionCreators      // ... plus action creators we've requested
    & RouteComponentProps<{}>;


class Inventory extends React.Component<InventoryStateProps, {}> {
    constructor(props: InventoryStateProps) {
        super(props);
    }

    componentWillMount() {
        this.props.requestInventory();
        setInterval(this.props.requestInventory, 2000);
    }

    componentWillReceiveProps(nextProps: InventoryStateProps) {
        
    }

    public render() {
        return (
            <div className="inventory">
                { this.renderInventory() }
            </div>
        );
    }

    private renderInventory() {
        const styles = {
            root: {
                'display': 'flex',
                'flex-wrap': 'wrap',
                'justify-content': 'space-around',
            },
            gridList: {
                'width': 500,
                'height': 450,
                'overflow-y': 'auto',
            },
            titleStyle: {
                color: 'rgb(0, 188, 212)',
            },
            pokeStyle: {

            },
            itemStyle: {
                'margin-top': 45,
                height: 100,
                width: 75
            }
        };

        return (
                <div style={styles.root}>
                    <GridList style={styles.gridList} cols={4}>
                        {this.props.inventory.map((item) => (
                            <GridListTile key={item.id} cols={1}>
                                <img src={item.img} alt={item.name} style={item.count === null ? styles.pokeStyle : styles.itemStyle}/>
                                <GridListTileBar title={item.count === null ? 'lv.' + item.level : item.count.toString()} />
                            </GridListTile>
                        ))}
                    </GridList>
                </div>
        );
    }
};

export default connect(
    (state: ApplicationState) => state.inventory, // Selects which state properties are merged into the component's props
    InventoryState.actionCreators                 // Selects which action creators are merged into the component's props
)(Inventory) as typeof Inventory;


