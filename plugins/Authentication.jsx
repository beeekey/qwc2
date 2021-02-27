/**
 * Copyright 2018-2021 Sourcepole AG
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import url from 'url';
import ConfigUtils from '../utils/ConfigUtils';

class Authentication extends React.Component {
    static propTypes = {
        clearLayerParam: PropTypes.bool,
        idleTimeout: PropTypes.number,
        task: PropTypes.string
    }
    constructor(props) {
        super(props);
        this.idleTimer = null;
    }
    componentDidMount() {
        const username = ConfigUtils.getConfigProp("username");
        if (this.props.idleTimeout && username) {
            this.idleTimer = setTimeout(this.idleAutologout, this.props.idleTimeout * 1000);
            window.addEventListener('keydown', this.resetIdleTimer, {passive: true});
            window.addEventListener('mousedown', this.resetIdleTimer, {passive: true});
            window.addEventListener('wheel', this.resetIdleTimer, {passive: true});
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.task !== prevProps.task) {
            if (this.props.task === "Login") {
                const urlObj = url.parse(window.location.href, true);
                if (this.props.clearLayerParam) {
                    delete urlObj.query.l;
                }
                urlObj.search = undefined;
                window.location.href = ConfigUtils.getConfigProp("authServiceUrl") + "login?url=" + encodeURIComponent(url.format(urlObj));
            } else if (this.props.task === "Logout") {
                window.location.href = ConfigUtils.getConfigProp("authServiceUrl") + "logout?url=" + encodeURIComponent(window.location.href);
            }
        }
    }
    resetIdleTimer = () => {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(this.idleAutologout, this.props.idleTimeout * 1000);
        }
    }
    idleAutologout = () => {
        const urlObj = url.parse(window.location.href, true);
        if (this.props.clearLayerParam) {
            urlObj.query.l = undefined;
        }
        urlObj.search = undefined;
        const loginUrl = ConfigUtils.getConfigProp("authServiceUrl") + "login?url=" + encodeURIComponent(url.format(urlObj));
        window.location.href = ConfigUtils.getConfigProp("authServiceUrl") + "logout?url=" + encodeURIComponent(loginUrl);
    }
    render() {
        return null;
    }
}

export default connect(state => ({
    task: state.task.id
}), {
})(Authentication);
