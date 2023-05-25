import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Icon from '../Icon';
import PopupMenu from '../PopupMenu';
import './style/MenuButton.css';

export default class MenuButton extends React.Component {
    static propTypes = {
        active: PropTypes.string,
        children: PropTypes.array,
        className: PropTypes.string,
        menuClassName: PropTypes.string,
        menuIcon: PropTypes.string,
        menuLabel: PropTypes.string,
        onActivate: PropTypes.func,
        readOnly: PropTypes.bool
    };
    state = {
        popup: false,
        selected: null
    };
    static defaultProps = {
        readOnly: false
    };
    constructor(props) {
        super(props);
        this.el = null;
        if (!props.menuIcon && !props.menuLabel) {
            this.state.selected = this.props.active ?? props.children.length > 0 ? props.children[0].props.value : null;
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.active !== prevProps.active && this.props.active && this.props.active !== this.state.selected) {
            this.setState({selected: this.props.active});
        }
    }
    render() {
        const children = React.Children.toArray(this.props.children);
        const rect = this.el ? this.el.getBoundingClientRect() : null;
        let buttonContents = null;
        if (this.props.menuIcon || this.props.menuLabel) {
            buttonContents = [
                this.props.menuIcon ? (<Icon icon={this.props.menuIcon} key="icon" />) : null,
                this.props.menuLabel ? (<span>{this.props.menuLabel}</span>) : null
            ];
        } else {
            buttonContents = children.filter((child) => child.props.value === this.state.selected);
        }
        const buttonClassnames = classnames({
            "menubutton-button": true,
            "menubutton-button-active": !!this.props.active,
            "menubutton-button-hover": this.state.popup
        });
        return (
            <div className={"menubutton " + (this.props.className || "")} ref={el => { this.el = el; }}>
                <div className={buttonClassnames}>
                    <span className="menubutton-button-content" onClick={this.onButtonClicked}>
                        {buttonContents}
                    </span>
                    <span className="menubotton-combo-arrow" onClick={this.onMenuClicked}>
                        <Icon icon="chevron-down" />
                    </span>
                </div>
                {this.el && this.state.popup ? (
                    <PopupMenu className={"menubutton-menu" + (this.props.menuClassName ? " " + this.props.menuClassName : "")} onClose={() => this.setState({popup: false})} width={rect.width} x={rect.left} y={rect.bottom}>
                        {children.map(child => {
                            const classNames = classnames({
                                "menubutton-menu-active": child.props.value === this.state.selected && !child.props.disabled,
                                "menubutton-menu-disabled": child.props.disabled
                            });
                            return (
                                <div className={classNames + " " + (child.props.className || "")} key={child.props.value} onClickCapture={() => this.onChildClicked(child)}>
                                    {child}
                                </div>
                            );
                        })}
                    </PopupMenu>
                ) : null}
            </div>
        );
    }
    onMenuClicked = () => {
        if (!this.props.readOnly) {
            this.setState({popup: true});
        }
    };
    onButtonClicked = () => {
        if (this.state.selected) {
            this.props.onActivate(this.state.selected);
        } else {
            this.onMenuClicked();
        }
    };
    onChildClicked = (child) => {
        if (!child.props.disabled) {
            if (this.state.selected) {
                this.setState({selected: child.props.value});
            }
            this.props.onActivate(child.props.value);
        }
    };
}
