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

type InventoryStateProps =
    InventoryState.InventoryListState        
    & typeof InventoryState.actionCreators    
    & RouteComponentProps<{}>;

class ItemInformation extends React.Component<InventoryStateProps, {}> {
    constructor(props: InventoryStateProps) {
        super(props);
    }

};

export default connect(
    (state: ApplicationState) => state.inventory,
    InventoryState.actionCreators
)(ItemInformation) as typeof ItemInformation;