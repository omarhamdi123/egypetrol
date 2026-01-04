        function switchTab(tab) {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(tab + '-tab').classList.add('active');

            // Hide results
            document.querySelectorAll('.results').forEach(result => result.classList.remove('show'));
        }

        // Hydrogen Content Calculator
        document.getElementById('eqType').addEventListener('change', function() {
            const eqType = this.value;
            const gravityGroup = document.getElementById('gravityGroup');
            const distillationFGroup = document.getElementById('distillationFGroup');
            const distillationCGroup = document.getElementById('distillationCGroup');
            const densityGroup = document.getElementById('densityGroup');
            const gravity = document.getElementById('gravity');
            const distillationF = document.getElementById('distillationF');
            const distillationC = document.getElementById('distillationC');
            const density = document.getElementById('density');

            if (eqType === 'eq1') {
                gravityGroup.style.display = 'block';
                distillationFGroup.style.display = 'block';
                distillationCGroup.style.display = 'none';
                densityGroup.style.display = 'none';
                gravity.required = true;
                distillationF.required = true;
                distillationC.required = false;
                density.required = false;
            } else if (eqType === 'eq2') {
                gravityGroup.style.display = 'none';
                distillationFGroup.style.display = 'none';
                distillationCGroup.style.display = 'block';
                densityGroup.style.display = 'block';
                gravity.required = false;
                distillationF.required = false;
                distillationC.required = true;
                density.required = true;
            } else {
                gravityGroup.style.display = 'block';
                distillationFGroup.style.display = 'block';
                distillationCGroup.style.display = 'block';
                densityGroup.style.display = 'block';
                gravity.required = true;
                distillationF.required = true;
                distillationC.required = true;
                density.required = true;
            }
        });

        document.getElementById('hydrogenForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const eqType = document.getElementById('eqType').value;
            const G = parseFloat(document.getElementById('gravity').value) || 0;
            const A = parseFloat(document.getElementById('aromatics').value);
            const V = parseFloat(document.getElementById('distillationF').value) || 0;
            const T = parseFloat(document.getElementById('distillationC').value) || 0;
            const D = parseFloat(document.getElementById('density').value) || 0;

            let H1 = null;
            if (eqType === 'eq1' || eqType === 'both') {
                H1 = (0.06317 * G) - (0.041089 * A) + (0.000072135 * A * V) + 
                     (0.00005684 * G * V) - (0.0004960 * G * A) + 10.56;
            }

            let H2 = null;
            if (eqType === 'eq2' || eqType === 'both') {
                H2 = (9201.2 + 14.49 * T - 70.22 * A) / D + 
                     0.02652 * A + 0.0001298 * A * T - 0.01347 * T + 2.003;
            }

            const h1Result = document.getElementById('h1Result');
            const h2Result = document.getElementById('h2Result');

            if (H1 !== null) {
                document.getElementById('h1Value').textContent = H1.toFixed(4) + ' %';
                h1Result.style.display = 'block';
            } else {
                h1Result.style.display = 'none';
            }

            if (H2 !== null) {
                document.getElementById('h2Value').textContent = H2.toFixed(4) + ' %';
                h2Result.style.display = 'block';
            } else {
                h2Result.style.display = 'none';
            }

            document.getElementById('hydrogenResults').classList.add('show');
        });

        // Heat of Combustion Calculator
        document.getElementById('combustionForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const rho = parseFloat(document.getElementById('densityComb').value);
            const A_aniline = parseFloat(document.getElementById('aniline').value);
            const A_arom = parseFloat(document.getElementById('aromaticsComb').value);
            const S = parseFloat(document.getElementById('sulfur').value);

            // Equation 1: Qp calculation
            const Qp = 22.9596 - 0.0126587 * A_arom + 
                       26640.9 * (1/rho) + 32.622 * (A_aniline/rho) - 
                       6.69030e-5 * Math.pow(A_aniline, 2) - 
                       9217760 * Math.pow(1/rho, 2);

            // Equation 2: Q'p corrected for sulfur
            const Qp_corrected = Qp - 0.1163 * S;

            // Equation 3: qp volumetric heat
            const qp = Qp_corrected * rho * 1e-3;

            document.getElementById('qpValue').textContent = Qp.toFixed(4) + ' MJ/kg';
            document.getElementById('qpCorrectedValue').textContent = Qp_corrected.toFixed(4) + ' MJ/kg';
            document.getElementById('qpVolValue').textContent = qp.toFixed(4) + ' MJ/L';

            document.getElementById('combustionResults').classList.add('show');
        });

        // Cetane Index Calculator
        document.getElementById('cetaneProcedure').addEventListener('change', function() {
            const procedure = this.value;
            const procedureAFields = document.getElementById('procedureAFields');
            const procedureBFields = document.getElementById('procedureBFields');
            const T10C = document.getElementById('T10C');
            const T50C = document.getElementById('T50C');
            const T90C = document.getElementById('T90C');
            const T10F = document.getElementById('T10F');
            const T50F = document.getElementById('T50F');
            const T90F = document.getElementById('T90F');

            if (procedure === 'A') {
                procedureAFields.style.display = 'block';
                procedureBFields.style.display = 'none';
                T10C.required = true;
                T50C.required = true;
                T90C.required = true;
                T10F.required = false;
                T50F.required = false;
                T90F.required = false;
            } else {
                procedureAFields.style.display = 'none';
                procedureBFields.style.display = 'block';
                T10C.required = false;
                T50C.required = false;
                T90C.required = false;
                T10F.required = true;
                T50F.required = true;
                T90F.required = true;
            }
        });

        document.getElementById('cetaneForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const procedure = document.getElementById('cetaneProcedure').value;
            const D = parseFloat(document.getElementById('densityCetane').value);
            let CCI;

            if (procedure === 'A') {
                // Procedure A - Equation 1 (°C)
                const T10 = parseFloat(document.getElementById('T10C').value);
                const T50 = parseFloat(document.getElementById('T50C').value);
                const T90 = parseFloat(document.getElementById('T90C').value);

                const DN = D - 0.85;
                const B = (T10 + 2*T50 + T90) / 4 - 215;
                const T10N = T50 - 215;
                const T50N = T90 - 260;
                const T90N = T90 - 310;

                CCI = 45.2 + (0.0892 * T10N) + (0.131 + (0.901*B)) * T50N + (0.0523 - (0.420*B)) * T90N + 
                      (0.00049 * Math.pow(T10N, 2) - Math.pow(T90N, 2)) + (107*B) + (60 * DN * DN);
            } else {
                // Procedure B - Equation 3 (°F)
                const T10 = parseFloat(document.getElementById('T10F').value);
                const T50 = parseFloat(document.getElementById('T50F').value);
                const T90 = parseFloat(document.getElementById('T90F').value);

                CCI = -399.90 * D + 0.06183 * T10 + 0.06733 * T50 + 0.03489 * T90 + 304.09;
            }

            document.getElementById('cciValue').textContent = CCI.toFixed(2);
            document.getElementById('cetaneResults').classList.add('show');
        });
