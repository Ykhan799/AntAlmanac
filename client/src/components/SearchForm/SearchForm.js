import DeptSearchBar from './DeptSearchBar/DeptSearchBar';
import GESelector from './GESelector/GESelector';
import TermSelector from './TermSelector';
import CourseCodeSearchBar from './CourseCodeSearchBar';
import React, { Component } from 'react';
import { Button, Typography, Collapse } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AdvancedSearchTextFields from './AdvancedSearch';
// import MIUCI from "./MIUCI.png";
import { ExpandMore, ExpandLess } from '@material-ui/icons';
import ReactGA from 'react-ga';
import loadingGif from './Gifs/loading.mp4';
import querystring from 'querystring';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
    },
    search: {
        display: 'flex',
        justifyContent: 'center',
        borderTop: 'solid 8px transparent',
    },
    margin: {
        borderTop: 'solid 8px transparent',
    },
    // miuci: {
    //   width: "35%",
    //   position: "absolute",
    //   bottom: 0,
    //   right: 0
    // },
    new: {
        width: '55%',
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
};

class SearchForm extends Component {
    constructor(props) {
        super(props);

        let advanced = false;
        if (typeof Storage !== 'undefined') {
            advanced = window.localStorage.getItem('advanced');
            if (advanced === null) {
                //first time nothing stored
                advanced = false;
            } else {
                //not first
                advanced = advanced === 'expanded';
            }
        }

        this.state = {
            dept: '',
            label: '',
            ge: 'ANY',
            term: '2019 Fall',
            courseNum: '',
            courseCode: '',
            instructor: '',
            units: '',
            endTime: '',
            startTime: '',
            coursesFull: 'ANY',
            building: '',
            expandAdvanced: advanced,
            searched: false,
        };
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.enterEvent, false);
    };

    componentWillUnmount = () => {
        document.addEventListener('keydown', this.enterEvent, false);
    };

    //if enter is perssed
    enterEvent = (event) => {
        const charCode = event.which ? event.which : event.keyCode;
        if (
            (charCode === 13 || charCode === 10) &&
            document.activeElement.id === 'downshift-0-input'
        ) {
            this.props.updateFormData(this.state);
            event.preventDefault();

            return false;
        }
    };

    shouldComponentUpdate = (nextProps, nextState) => {
        return this.state !== nextState;
    };

    //grab Data
    fetchData = async () => {
        this.setState({ searched: true }, async () => {
            const {
                dept,
                term,
                ge,
                courseNum,
                courseCode,
                instructor,
                units,
                endTime,
                startTime,
                coursesFull,
                building,
            } = this.state;

            ReactGA.event({
                category: 'Search',
                action: dept,
                label: term,
            });

            const params = {
                department: dept,
                term: term,
                ge: ge,
                courseNumber: courseNum,
                sectionCodes: courseCode,
                instructorName: instructor,
                units: units,
                endTime: endTime,
                startTime: startTime,
                fullCourses: coursesFull,
                building: building,
            };

            const response1 = await fetch('/api/websocapi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            const jsonResp = await response1.json();

            this.props.updateData(jsonResp, term, dept, ge);
        });
    };

    //change department
    setDept = (dept) => {
        if (dept == null) this.setState({ dept: null });
        else this.setState({ dept: dept.value, label: dept.label });
    };

    //change to and from advanced search
    handleAdvancedSearchChange = (advancedSearchState) => {
        this.setState(advancedSearchState);
    };

    //set ge type
    setGE = (ge) => {
        this.setState({ ge: ge });
    };

    //changing terms
    setTerm = (term) => {
        this.setState({ term: term });
    };

    //expanding the advanced tab
    handleExpand = () => {
        const nextExpansionState = !this.state.expandAdvanced;
        window.localStorage.setItem(
            'advanced',
            nextExpansionState ? 'expanded' : 'notexpanded'
        );
        this.setState({ expandAdvanced: nextExpansionState });
    };

    render() {
        const { classes } = this.props;

        if (this.state.searched) {
            return (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white',
                    }}
                >
                    <video autoPlay loop>
                        <source src={loadingGif} type="video/mp4" />
                    </video>
                </div>
            );
        } else {
            return (
                <div className={classes.container}>
                    <div className={classes.margin}>
                        <TermSelector
                            term={this.state.term}
                            setTerm={this.setTerm}
                        />
                    </div>

                    <div>
                        <DeptSearchBar
                            dept={this.state.label}
                            setDept={this.setDept}
                        />
                    </div>

                    <div
                        className={classes.margin}
                        style={{ display: 'inline-flex' }}
                    >
                        <GESelector ge={this.state.ge} setGE={this.setGE} />
                        <CourseCodeSearchBar
                            onAdvancedSearchChange={
                                this.handleAdvancedSearchChange
                            }
                        />
                    </div>

                    <div
                        onClick={this.handleExpand}
                        style={{
                            display: 'inline-flex',
                            marginTop: 5,
                            cursor: 'pointer',
                        }}
                    >
                        <div style={{ flexGrow: 1 }}>
                            <Typography noWrap variant="subheading">
                                Advanced Search Options
                            </Typography>
                        </div>
                        {this.state.expandAdvanced ? (
                            <ExpandLess />
                        ) : (
                            <ExpandMore />
                        )}
                    </div>
                    <Collapse in={this.state.expandAdvanced}>
                        <AdvancedSearchTextFields
                            params={this.state}
                            onAdvancedSearchChange={
                                this.handleAdvancedSearchChange
                            }
                        />
                    </Collapse>

                    <div className={classes.search}>
                        <Button
                            variant="contained"
                            onClick={() => this.fetchData(this.state)}
                            style={{
                                backgroundColor: '#72a9ed',
                                boxShadow: 'none',
                            }}
                        >
                            Search
                        </Button>
                    </div>

                    <div className={classes.new}>
                        <Typography>
                            <b>New on AntAlmanac:</b>
                            <br />
                            Add online/TBA classes!
                            <br />
                            Download .ics files of your calendars!
                            <br />
                            See finals schedules
                        </Typography>
                    </div>
                </div>
            );
        }
    }
}

export default withStyles(styles)(SearchForm);