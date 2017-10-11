import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Inventory from './Inventory';
import ItemList from './ItemList';
import { ApplicationState } from "../store";
import * as InventoryState from '../store/Inventory';
import * as ItemListState from '../store/ItemList';
import { withStyles } from 'material-ui/styles';
import { LinearProgress } from 'material-ui/Progress';

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
            },
            wrapper: {
                position: 'relative' as 'relative'
            }
        }; 
        return (
            <div style={styles.container}>
                <LinearProgress style={{ visibility: this.props.addItemLoading === true ? 'visible' : 'hidden' }} color = "accent" mode="query" />
                <Card style={styles.card}> 
                    <CardMedia style={styles.media}>
                        <img src="/resources/logo.png" style={styles.image} alt="logo" />
                    </CardMedia>
                    <CardContent style={styles.content} >
                        <div style={styles.wrapper}>
                            <ItemList {...this.props} />
                            <Inventory {...this.props} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => (state.inventory, state.itemlist), 
    (InventoryState.actionCreators, ItemListState.actionCreators)   
)(Home) as typeof Home;