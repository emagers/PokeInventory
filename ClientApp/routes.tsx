import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './components/Home';
import ItemList from './components/ItemList';
import Inventory from './components/Inventory';

export const routes = <Layout>
    <Route exact path='/' component={Home} />
    <Route path='/itemlist' component={ ItemList } />
    <Route path='/inventory' component={ Inventory } />
</Layout>;
