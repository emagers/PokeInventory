import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Inventory from './Inventory';
import ItemList from './ItemList';
import { ApplicationState } from "../store";
import * as InventoryState from '../store/Inventory';
import * as ItemListState from '../store/ItemList';

type ApplicationStateProps =
    InventoryState.InventoryListState
    & ItemListState.ItemListState   // ... state we've requested from the Redux store
    & typeof InventoryState.actionCreators// ... plus action creators we've requested
    & typeof ItemListState.actionCreators
    & RouteComponentProps<{}>;

class Home extends React.Component<ApplicationStateProps, {}> {
    public render() {
        const styles = {
            container: {
                'min-width': '100%',
                'min-height': '100%',
                'justify-content': 'center'
            },
            card: {
                width: 500,
                'min-width': '50%',
                'margin-left': '25%',
                'margin-right': '25%'
            },
            media: {
                height: 200,
                'text-align': 'center'
            },
            image: {
                width: 400,
                height: 200
            },
            content: {
                'text-align': 'center'
            }
        }
        return (
            <div style={styles.container}>
                <Card style={styles.card}> 
                    <CardMedia style={styles.media}>
                        <img src="/resources/logo.png" style={styles.image} alt="logo" />
                    </CardMedia>
                    <CardContent style={styles.content} >
                        <ItemList {...this.props} />
                        <Inventory {...this.props} />
                    </CardContent>
                </Card>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => (state.inventory, state.itemlist), // Selects which state properties are merged into the component's props
    (InventoryState.actionCreators, ItemListState.actionCreators)             // Selects which action creators are merged into the component's props
)(Home) as typeof Home;