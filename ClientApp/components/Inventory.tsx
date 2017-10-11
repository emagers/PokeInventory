import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as InventoryState from '../store/Inventory';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import InfoIcon from 'material-ui-icons/Info';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

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
                'margin-top': 100,
                'display': 'flex',
                'flex-wrap': 'wrap',
                'justify-content': 'space-around',
                'z-index': 1
            },
            gridList: {
                'width': 500,
                'height': 450,
                'overflow-y': 'auto'
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
            },
            imageDescStyle: {
                width: 400,
                height: 200
            }
        };

        let sItem = this.props.selectedItem;
        let sPoke = this.props.selectedPokemon;

        let iDiag;
        if (sItem !== undefined) {
            iDiag = (
                <Dialog open={this.props.selectedItem !== undefined} onRequestClose={this.handleRequestClose}>
                    <DialogTitle>
                        <span style={{ 'float': 'left' }}>
                            {sItem.name}
                        </span>
                        <span style={{ 'float': 'right' }}>
                            {sItem.count}
                        </span>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <span style={{ 'float': 'left' }}>
                                <img src={sItem.img} alt={sItem.name} />
                            </span>
                            <span style={{ 'float': 'right' }}>
                                {sItem.description}
                            </span>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleRequestClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            );
        }

        let pDiag;
        if (sPoke !== undefined) {
            pDiag = (
                <Dialog open={this.props.selectedPokemon !== undefined} onRequestClose={this.handleRequestClose}>
                    <DialogTitle>
                        <span style={{ 'float': 'left' }}>
                            {sPoke.name}
                        </span>
                        <span style={{ 'float': 'right' }}>
                            lv.{sPoke.level}
                        </span>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <div style={styles.imageDescStyle}>
                                <span style={{ 'float': 'left' }}>
                                    <img src={sPoke.img} alt={sPoke.name} />
                                </span>
                                <span style={{ 'float': 'right' }}>
                                    {sPoke.description}
                                </span>
                            </div>
                            <div>
                                {this.props.error}
                            </div>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleLevelUp} color="primary">
                            Level Up
                            </Button>
                        <Button onClick={this.handleRequestClose} color="primary">
                            Close
                            </Button>
                    </DialogActions>
                </Dialog>
                );
        }

        return (
            <div style={styles.root}>
                {iDiag}
                {pDiag}
                <GridList style={styles.gridList} cols={4}>
                    {this.props.inventory.map((item) => (
                        <GridListTile key={item.id} cols={1}>
                            <img src={item.img} alt={item.name} style={item.count === null ? styles.pokeStyle : styles.itemStyle}/>
                            <GridListTileBar title={item.count === null ? 'lv.' + item.level : item.count.toString()} actionIcon={<IconButton onClick={this.handleOpenModal.bind(this, item)}> <InfoIcon /> </IconButton>} />
                        </GridListTile>
                    ))}
                </GridList>
            </div>
        );
    }

    private handleOpenModal = (item: InventoryState.InventoryItem) => {
        this.props.selectInventoryItem(item.id);
    }

    private handleLevelUp = () => {
        let found = false;
        let inv = this.props.inventory;
        for (let i = 0; i < inv.length && !found; i++) {
            if (inv[i].name === "Rare Candy") {
                found = true;
            }
        }

        if (found) {
            this.props.levelUpPokemon();
        }
        else {
            this.props.setError();
        }
    }

    handleRequestClose = () => {
        this.props.removeSelectedItem();
    }
};

export default connect(
    (state: ApplicationState) => state.inventory, // Selects which state properties are merged into the component's props
    InventoryState.actionCreators                 // Selects which action creators are merged into the component's props
)(Inventory) as typeof Inventory;


